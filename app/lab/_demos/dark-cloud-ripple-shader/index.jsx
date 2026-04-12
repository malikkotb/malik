"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import GUI from "lil-gui";

// ─── SIMULATION CONSTANTS ─────────────────────────────────────────────────────
const SIM_RES        = 256;    // velocity / pressure / divergence grid
const DYE_RES        = 1024;   // ink grid (higher = sharper edges)
const PRESSURE_ITERS = 25;     // Jacobi iterations per frame (more = more incompressible)

// ─── VERTEX: NEIGHBORS ────────────────────────────────────────────────────────
// Used by divergence, pressure, gradient-subtract passes.
// Pre-computes 4-neighbor UVs in the vertex shader so fragment can do
// a single texel-offset lookup without arithmetic per fragment.
const VERT_NEIGHBORS = /* glsl */`
  varying vec2 vUv;
  varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
  uniform vec2 u_texel; // (1/width, 1/height) of the simulation grid

  void main() {
    vUv = uv;
    vL = vUv - vec2(u_texel.x, 0.0);
    vR = vUv + vec2(u_texel.x, 0.0);
    vT = vUv + vec2(0.0,  u_texel.y);
    vB = vUv - vec2(0.0,  u_texel.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ─── VERTEX: SIMPLE ───────────────────────────────────────────────────────────
// Used by advection, splat, and display — neighbor UVs not needed.
const VERT_SIMPLE = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ─── FRAGMENT: DIVERGENCE (FB 37) ────────────────────────────────────────────
// Computes ∇·v using central finite differences.
// R channel = scalar divergence — the right-hand side for pressure Poisson.
// Positive = fluid expanding (source), negative = converging (sink).
// 0.35 ≈ 0.5/dx — the scaling constant from the original capture.
const FRAG_DIVERGENCE = /* glsl */`
  precision highp float;
  varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
  uniform sampler2D u_velocity_texture;

  void main() {
    float L = texture2D(u_velocity_texture, vL).x; // left neighbor  vx
    float R = texture2D(u_velocity_texture, vR).x; // right neighbor vx
    float T = texture2D(u_velocity_texture, vT).y; // top neighbor   vy
    float B = texture2D(u_velocity_texture, vB).y; // bottom neighbor vy
    gl_FragColor = vec4(0.35 * (R - L + T - B), 0.0, 0.0, 1.0);
  }
`;

// ─── FRAGMENT: PRESSURE ───────────────────────────────────────────────────────
// One Jacobi iteration for solving ∇²p = ∇·v.
// Standard 5-point stencil: p_new = (L+R+T+B - div) / 4.
// Run ~25 times per frame ping-ponging between two pressure RTs.
const FRAG_PRESSURE = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
  uniform sampler2D u_pressure_texture;
  uniform sampler2D u_divergence_texture;

  void main() {
    float L   = texture2D(u_pressure_texture, vL).x;
    float R   = texture2D(u_pressure_texture, vR).x;
    float T   = texture2D(u_pressure_texture, vT).x;
    float B   = texture2D(u_pressure_texture, vB).x;
    float div = texture2D(u_divergence_texture, vUv).x;
    gl_FragColor = vec4((L + R + T + B - div) * 0.25, 0.0, 0.0, 1.0);
  }
`;

// ─── FRAGMENT: GRADIENT SUBTRACT ─────────────────────────────────────────────
// Removes the pressure gradient from velocity: v = v - ∇p.
// This is the projection step — it enforces incompressibility (∇·v ≈ 0).
// Without this, fluid would compress/expand unnaturally.
const FRAG_GRAD_SUBTRACT = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
  uniform sampler2D u_pressure_texture;
  uniform sampler2D u_velocity_texture;

  void main() {
    float pL = texture2D(u_pressure_texture, vL).x;
    float pR = texture2D(u_pressure_texture, vR).x;
    float pT = texture2D(u_pressure_texture, vT).x;
    float pB = texture2D(u_pressure_texture, vB).x;
    vec2  vel = texture2D(u_velocity_texture, vUv).xy;
    vel -= vec2(pR - pL, pT - pB); // central-difference gradient subtraction
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

// ─── FRAGMENT: ADVECTION (FB 40) ─────────────────────────────────────────────
// Semi-Lagrangian advection — the core of the sim.
// Instead of moving fluid forward (unstable), we trace each cell backwards:
// "what was at the position I came from dt seconds ago?"
//
// u_texel     = texel size of the quantity being advected (dye or velocity)
// u_vel_texel = texel size of velocity grid (may differ from quantity grid)
// u_text_texture = white-on-black text mask; where text is white, dissipation
//                  drops from 0.945 → 0.995 so ink clings to text regions.
//
// bilerp(): manual bilinear interpolation avoids the half-texel offset
// artifacts that hardware bilinear produces at low simulation resolutions.
const FRAG_ADVECT = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D u_velocity_texture;
  uniform sampler2D u_input_texture;
  uniform sampler2D u_text_texture;
  uniform vec2  u_texel;      // texel size of the quantity texture
  uniform vec2  u_vel_texel;  // texel size of the velocity texture
  uniform float u_dt;
  uniform float u_dissipation;
  uniform float u_use_text;   // 0 = ignore text mask, 1 = enable

  vec4 bilerp(sampler2D sam, vec2 uv, vec2 tsize) {
    vec2 st  = uv / tsize - 0.5;
    vec2 iuv = floor(st);
    vec2 fuv = fract(st);
    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
  }

  void main() {
    // Trace backwards along velocity field to find source position
    vec2 vel   = bilerp(u_velocity_texture, vUv, u_vel_texel).xy;
    vec2 coord = vUv - u_dt * vel * u_texel;

    // Text mask: ink dissipates slower where text is (makes ink "stick" to letters)
    float text = texture2D(u_text_texture, vec2(vUv.x, 1.0 - vUv.y)).r;
    float dissipation = u_dissipation + text * 0.05 * u_use_text;

    gl_FragColor = dissipation * bilerp(u_input_texture, coord, u_texel);
    gl_FragColor.a = 1.0;
  }
`;

// ─── FRAGMENT: SPLAT ─────────────────────────────────────────────────────────
// Injects a circular Gaussian blob of velocity or dye at the mouse position.
// u_aspect corrects for non-square screens so the splat stays circular.
const FRAG_SPLAT = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D u_input_texture;
  uniform vec2  u_point;   // mouse in [0,1] UV space
  uniform vec3  u_color;   // velocity delta (xy) or dye amount (rgb)
  uniform float u_radius;  // Gaussian radius (smaller = tighter splat)
  uniform float u_aspect;  // screen width / height

  void main() {
    vec2 p = vUv - u_point;
    p.x *= u_aspect;        // correct to make splat circular, not elliptical
    float strength = exp(-dot(p, p) / u_radius);
    gl_FragColor = texture2D(u_input_texture, vUv) + vec4(u_color * strength, 0.0);
  }
`;

// ─── FRAGMENT: DISPLAY ────────────────────────────────────────────────────────
// Final pass: renders dye field to screen.
// Dye = 0 → white (no ink), Dye = 1 → u_ink_color (full ink).
const FRAG_DISPLAY = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D u_dye_texture;
  uniform vec3 u_ink_color; // RGB ink color in linear space

  void main() {
    float ink = texture2D(u_dye_texture, vUv).r;
    // Blend from white background toward ink color based on dye amount
    vec3 color = mix(vec3(1.0), u_ink_color, ink);
    gl_FragColor = vec4(color, 1.0);
  }
`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function DarkCloudRippleShader() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    // ── Debug config (lil-gui tweaks write into this object every frame) ──────
    const config = {
      splatRadius:      0.0005, // Gaussian brush radius in UV² space
      forceScale:       6.0,    // mouse delta → fluid force multiplier
      velDissipation:   0.98,   // velocity decay per frame (1 = stays forever)
      dyeDissipation:   0.945,  // ink decay per frame (lower = fades faster)
      inkColor:         "#000000", // display color of the ink
    };

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(1); // always 1 — resolution is controlled via render targets
    renderer.setClearColor(0xffffff, 1);
    containerRef.current.appendChild(renderer.domElement);

    // ── Orthographic camera fills the unit-plane quad exactly ─────────────────
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    camera.position.set(0, 0, 1);

    // ── Single 1×1 plane reused across every pass ─────────────────────────────
    const quad  = new THREE.Mesh(new THREE.PlaneGeometry(1, 1));
    const scene = new THREE.Scene();
    scene.add(quad);

    // ── Render-target factory ─────────────────────────────────────────────────
    // HalfFloat supports negative values (needed for velocity x/y components).
    const makeRT = (w, h) => new THREE.WebGLRenderTarget(w, h, {
      minFilter:    THREE.LinearFilter,
      magFilter:    THREE.LinearFilter,
      format:       THREE.RGBAFormat,
      type:         THREE.HalfFloatType,
      depthBuffer:  false,
      stencilBuffer: false,
    });

    // Ping-pong wrapper: always read from .read, write to .write, then swap.
    const makePingPong = (w, h) => ({
      read:  makeRT(w, h),
      write: makeRT(w, h),
      swap() { [this.read, this.write] = [this.write, this.read]; },
    });

    // Simulation grid (velocity, pressure, divergence) — lower res for perf
    const simW = SIM_RES;
    const simH = Math.round(SIM_RES / (W / H)); // maintain screen aspect ratio

    // Dye grid — higher res for sharp ink edges
    const dyeW = DYE_RES;
    const dyeH = Math.round(DYE_RES / (W / H));

    const velocity   = makePingPong(simW, simH);
    const dye        = makePingPong(dyeW, dyeH);
    const pressure   = makePingPong(simW, simH);
    const divergence = makeRT(simW, simH); // single RT, no ping-pong needed

    // Pre-computed texel sizes (1/width, 1/height) for each grid
    const simTexel = new THREE.Vector2(1 / simW, 1 / simH);
    const dyeTexel = new THREE.Vector2(1 / dyeW, 1 / dyeH);

    // Blank 1×1 black texture — default for u_text_texture when mask is off
    const blackTex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    blackTex.needsUpdate = true;

    // ── Materials (one per shader pass) ───────────────────────────────────────

    // Divergence: computes ∇·v at sim resolution
    const divergenceMat = new THREE.ShaderMaterial({
      vertexShader:   VERT_NEIGHBORS,
      fragmentShader: FRAG_DIVERGENCE,
      uniforms: {
        u_velocity_texture: { value: null },
        u_texel: { value: simTexel },
      },
    });

    // Pressure: one Jacobi step at sim resolution
    const pressureMat = new THREE.ShaderMaterial({
      vertexShader:   VERT_NEIGHBORS,
      fragmentShader: FRAG_PRESSURE,
      uniforms: {
        u_pressure_texture:   { value: null },
        u_divergence_texture: { value: null },
        u_texel: { value: simTexel },
      },
    });

    // Gradient subtract: removes ∇p from velocity at sim resolution
    const gradSubtractMat = new THREE.ShaderMaterial({
      vertexShader:   VERT_NEIGHBORS,
      fragmentShader: FRAG_GRAD_SUBTRACT,
      uniforms: {
        u_pressure_texture: { value: null },
        u_velocity_texture: { value: null },
        u_texel: { value: simTexel },
      },
    });

    // Velocity self-advection — both quantity and velocity are at sim resolution
    const velAdvectMat = new THREE.ShaderMaterial({
      vertexShader:   VERT_SIMPLE,
      fragmentShader: FRAG_ADVECT,
      uniforms: {
        u_velocity_texture: { value: null },
        u_input_texture:    { value: null },
        u_text_texture:     { value: blackTex },
        u_texel:            { value: simTexel }, // quantity texel = sim
        u_vel_texel:        { value: simTexel }, // velocity texel = sim
        u_dt:               { value: 0.016 },
        u_dissipation:      { value: config.velDissipation },
        u_use_text:         { value: 0 },
      },
    });

    // Dye advection — quantity at dye resolution, velocity at sim resolution
    const dyeAdvectMat = new THREE.ShaderMaterial({
      vertexShader:   VERT_SIMPLE,
      fragmentShader: FRAG_ADVECT,
      uniforms: {
        u_velocity_texture: { value: null },
        u_input_texture:    { value: null },
        u_text_texture:     { value: blackTex },
        u_texel:            { value: dyeTexel },  // quantity texel = dye grid
        u_vel_texel:        { value: simTexel },  // velocity texel = sim grid
        u_dt:               { value: 0.016 },
        u_dissipation:      { value: config.dyeDissipation },
        u_use_text:         { value: 0 },
      },
    });

    // Splat: Gaussian injection of velocity or dye
    const splatMat = new THREE.ShaderMaterial({
      vertexShader:   VERT_SIMPLE,
      fragmentShader: FRAG_SPLAT,
      uniforms: {
        u_input_texture: { value: null },
        u_point:  { value: new THREE.Vector2(0.5, 0.5) },
        u_color:  { value: new THREE.Vector3() },
        u_radius: { value: config.splatRadius },
        u_aspect: { value: W / H },
      },
    });

    // Display: renders dye to screen (white bg, configurable ink color)
    const displayMat = new THREE.ShaderMaterial({
      vertexShader:   VERT_SIMPLE,
      fragmentShader: FRAG_DISPLAY,
      uniforms: {
        u_dye_texture: { value: null },
        u_ink_color:   { value: new THREE.Color(0x000000) },
      },
    });

    // ── Pass runner ───────────────────────────────────────────────────────────
    // Swaps the quad's material and renders. target=null renders to canvas.
    const runPass = (mat, target) => {
      quad.material = mat;
      renderer.setRenderTarget(target ?? null);
      renderer.render(scene, camera);
    };

    // ── Splat helper ──────────────────────────────────────────────────────────
    // Injects velocity force (dx, dy) and ink at UV position (x, y).
    const splat = (x, y, dx, dy) => {
      // velocity splat — always uses white (direction encoded in sign of xy)
      splatMat.uniforms.u_input_texture.value = velocity.read.texture;
      splatMat.uniforms.u_point.value.set(x, y);
      splatMat.uniforms.u_color.value.set(dx, dy, 0);
      splatMat.uniforms.u_radius.value  = config.splatRadius;
      splatMat.uniforms.u_aspect.value  = W / H;
      runPass(splatMat, velocity.write);
      velocity.swap();

      // dye splat — always injects 1.0 into the dye field;
      // the display pass maps dye → ink color
      splatMat.uniforms.u_input_texture.value = dye.read.texture;
      splatMat.uniforms.u_point.value.set(x, y);
      splatMat.uniforms.u_color.value.set(1.0, 1.0, 1.0);
      runPass(splatMat, dye.write);
      dye.swap();
    };

    // ── Mouse tracking ────────────────────────────────────────────────────────
    const mouse = { x: -1, y: -1, px: -1, py: -1, moved: false };

    const onMouseMove = (e) => {
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.x  = e.clientX / W;
      mouse.y  = 1.0 - e.clientY / H; // flip Y — WebGL origin is bottom-left
      mouse.moved = true;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Animation loop ────────────────────────────────────────────────────────
    let animId;
    let lastTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt  = Math.min((now - lastTime) / 1000, 0.016); // cap at 16ms
      lastTime  = now;

      // 1. Mouse splat — inject force + dye wherever the cursor moved
      if (mouse.moved && mouse.px >= 0) {
        const dx = (mouse.x - mouse.px) * config.forceScale;
        const dy = (mouse.y - mouse.py) * config.forceScale;
        splat(mouse.x, mouse.y, dx, dy);
        mouse.moved = false;
      }

      // 2. Self-advect velocity — velocity field carries itself forward
      velAdvectMat.uniforms.u_velocity_texture.value = velocity.read.texture;
      velAdvectMat.uniforms.u_input_texture.value    = velocity.read.texture;
      velAdvectMat.uniforms.u_dt.value = dt;
      runPass(velAdvectMat, velocity.write);
      velocity.swap();

      // 3. Compute divergence of velocity (∇·v) — used as pressure RHS
      divergenceMat.uniforms.u_velocity_texture.value = velocity.read.texture;
      runPass(divergenceMat, divergence);

      // 4. Pressure solve — 25 Jacobi iterations converge ∇²p = ∇·v
      pressureMat.uniforms.u_divergence_texture.value = divergence.texture;
      for (let i = 0; i < PRESSURE_ITERS; i++) {
        pressureMat.uniforms.u_pressure_texture.value = pressure.read.texture;
        runPass(pressureMat, pressure.write);
        pressure.swap();
      }

      // 5. Gradient subtract — remove ∇p from velocity → divergence-free field
      gradSubtractMat.uniforms.u_pressure_texture.value = pressure.read.texture;
      gradSubtractMat.uniforms.u_velocity_texture.value = velocity.read.texture;
      runPass(gradSubtractMat, velocity.write);
      velocity.swap();

      // 6. Advect dye along the corrected (incompressible) velocity field
      dyeAdvectMat.uniforms.u_velocity_texture.value = velocity.read.texture;
      dyeAdvectMat.uniforms.u_input_texture.value    = dye.read.texture;
      dyeAdvectMat.uniforms.u_dt.value = dt;
      runPass(dyeAdvectMat, dye.write);
      dye.swap();

      // 7. Push live config values into shader uniforms each frame
      velAdvectMat.uniforms.u_dissipation.value = config.velDissipation;
      dyeAdvectMat.uniforms.u_dissipation.value = config.dyeDissipation;
      displayMat.uniforms.u_ink_color.value.set(config.inkColor);

      // 8. Display — render ink field to canvas (null = screen)
      displayMat.uniforms.u_dye_texture.value = dye.read.texture;
      runPass(displayMat, null);
    };

    animate();

    // ── lil-gui debug panel ───────────────────────────────────────────────────
    const gui = new GUI({ title: "Fluid Controls", width: 220 });
    gui.domElement.style.position = "fixed";
    gui.domElement.style.bottom   = "16px";
    gui.domElement.style.left     = "16px";
    gui.domElement.style.top      = "auto"; // override lil-gui default top positioning

    gui.add(config, "splatRadius", 0.0001, 0.003, 0.00005).name("brush size");
    gui.add(config, "forceScale",  1, 20, 0.5).name("force");
    gui.add(config, "velDissipation", 0.9, 1.0, 0.001).name("velocity decay");
    gui.add(config, "dyeDissipation", 0.9, 1.0, 0.001).name("ink decay");
    gui.addColor(config, "inkColor").name("ink color");

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      renderer.setSize(W, H);
      splatMat.uniforms.u_aspect.value = W / H;
      // Note: sim/dye RTs keep their fixed resolution — resize only affects display
    };
    window.addEventListener("resize", onResize);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      gui.destroy();
      [velocity, dye, pressure].forEach(({ read, write }) => {
        read.dispose();
        write.dispose();
      });
      divergence.dispose();
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="w-full fixed top-0 left-0" />;
}
