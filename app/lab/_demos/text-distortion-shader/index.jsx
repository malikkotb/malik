"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// import GUI from "lil-gui";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

async function createTextCanvasTexture(text, width, height, textColor, bgColor) {
  const font = new FontFace(
    "PPPangramSansRounded",
    "url(/fonts/sans-rounded/PPPangramSansRounded-CondensedBold.otf)"
  );
  await font.load();
  document.fonts.add(font);

  const dpr = Math.min(window.devicePixelRatio, 2);
  const canvas = document.createElement("canvas");
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  let fontSize = Math.min(width * 0.12, 200);
  ctx.font = `${fontSize}px PPPangramSansRounded, sans-serif`;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let metrics = ctx.measureText(text);
  while (metrics.width > width * 0.85 && fontSize > 20) {
    fontSize -= 2;
    ctx.font = `${fontSize}px PPPangramSansRounded, sans-serif`;
    metrics = ctx.measureText(text);
  }

  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.premultiplyAlpha = false;
  texture.needsUpdate = true;
  return texture;
}

export default function TextDistortionShader() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null); // holds { updateTexture, updateBg, sizes }

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("Biscotti Strudel Cannoli");
  const [textColor, setTextColor] = useState("#F5AAB0");
  const [bgColor, setBgColor] = useState("#072FE4");

  // draft state inside the panel (only applied on Apply)
  const [draftText, setDraftText] = useState(text);
  const [draftTextColor, setDraftTextColor] = useState(textColor);
  const [draftBgColor, setDraftBgColor] = useState(bgColor);

  const handleOpen = () => {
    setDraftText(text);
    setDraftTextColor(textColor);
    setDraftBgColor(bgColor);
    setOpen(true);
  };

  const handleApply = () => {
    setText(draftText);
    setTextColor(draftTextColor);
    setBgColor(draftBgColor);
    setOpen(false);
  };

  // Init Three.js once
  useEffect(() => {
    if (!containerRef.current) return;
    let cleanup;
    (async () => { cleanup = await init(); })();
    return () => cleanup?.();
  }, []);

  // Re-render texture when text/colors change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.updateTexture(text, textColor, bgColor);
    scene.updateBg(bgColor);
  }, [text, textColor, bgColor]);

  async function init() {
    if (!containerRef.current) return;

    const sizes = { width: window.innerWidth, height: window.innerHeight };
    const settings = { strength: 0.075, relaxation: 0.97, brushRadius: 0.045 };

    const gridSize = 128;
    const dataArray = new Float32Array(gridSize * gridSize * 4);
    let dataTexture = new THREE.DataTexture(dataArray, gridSize, gridSize, THREE.RGBAFormat, THREE.FloatType);
    dataTexture.magFilter = THREE.LinearFilter;
    dataTexture.minFilter = THREE.LinearFilter;
    dataTexture.needsUpdate = true;

    const scene = new THREE.Scene();
    const frustumSize = sizes.height;
    const aspect = sizes.width / sizes.height;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2, (frustumSize * aspect) / 2,
      frustumSize / 2, frustumSize / -2, -1000, 1000
    );
    camera.position.set(0, 0, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x072fe4, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);

    // read initial values from state refs so init captures them
    let currentText = "Biscotti Strudel Cannoli";
    let currentTextColor = "#F5AAB0";
    let currentBgColor = "#072FE4";

    let textTexture = await createTextCanvasTexture(currentText, sizes.width, sizes.height, currentTextColor, currentBgColor);

    const textMaterial = new THREE.ShaderMaterial({
      vertexShader, fragmentShader,
      uniforms: {
        uTexture: { value: textTexture },
        uDataTexture: { value: dataTexture },
        uResolution: { value: new THREE.Vector2(sizes.width, sizes.height) },
        uStrength: { value: settings.strength },
      },
    });

    const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(sizes.width, sizes.height), textMaterial);
    scene.add(textPlane);

    // Expose update functions via ref
    sceneRef.current = {
      updateTexture: (newText, newTextColor, newBgColor) => {
        currentText = newText;
        currentTextColor = newTextColor;
        currentBgColor = newBgColor;
        createTextCanvasTexture(newText, sizes.width, sizes.height, newTextColor, newBgColor).then((t) => {
          textTexture.dispose();
          textTexture = t;
          textMaterial.uniforms.uTexture.value = t;
        });
      },
      updateBg: (color) => {
        const hex = parseInt(color.replace("#", ""), 16);
        renderer.setClearColor(hex, 1);
      },
    };

    // Mouse tracking
    const mouse = { x: 0, y: 0 };
    const prevMouse = { x: 0, y: 0 };
    let mouseInitialized = false;

    const handleMouseMove = (e) => {
      if (!mouseInitialized) { prevMouse.x = e.clientX / sizes.width; prevMouse.y = e.clientY / sizes.height; mouseInitialized = true; }
      mouse.x = e.clientX / sizes.width;
      mouse.y = e.clientY / sizes.height;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        const tx = e.touches[0].clientX / sizes.width;
        const ty = e.touches[0].clientY / sizes.height;
        if (!mouseInitialized) { prevMouse.x = tx; prevMouse.y = ty; mouseInitialized = true; }
        mouse.x = tx; mouse.y = ty;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    // // GUI
    // const gui = new GUI({ width: 300, title: "Text Distortion" });
    // gui.domElement.style.position = "absolute";
    // gui.domElement.style.bottom = "0";
    // gui.domElement.style.left = "0";
    // gui.domElement.style.top = "auto";
    // gui.domElement.style.right = "auto";
    // gui.add(settings, "strength", 0.01, 0.2, 0.005).name("Strength");
    // gui.add(settings, "relaxation", 0.92, 0.995, 0.001).name("Relaxation");
    // gui.add(settings, "brushRadius", 0.02, 0.1, 0.005).name("Brush Radius");

    // Animation loop
    const animate = () => {
      const vx = mouse.x - prevMouse.x;
      const vy = mouse.y - prevMouse.y;
      prevMouse.x = mouse.x;
      prevMouse.y = mouse.y;

      const brushRadius = settings.brushRadius;
      const relaxation = settings.relaxation;

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const idx = (i * gridSize + j) * 4;
          const cellX = (j + 0.5) / gridSize;
          const cellY = (i + 0.5) / gridSize;
          const dx = cellX - mouse.x;
          const dy = cellY - (1.0 - mouse.y);
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < brushRadius) {
            const influence = 1.0 - dist / brushRadius;
            const smooth = influence * influence * (3.0 - 2.0 * influence);
            dataArray[idx] += vx * smooth * 20;
            dataArray[idx + 1] += -vy * smooth * 20;
          }

          dataArray[idx] *= relaxation;
          dataArray[idx + 1] *= relaxation;
          dataArray[idx] = Math.max(-1, Math.min(1, dataArray[idx]));
          dataArray[idx + 1] = Math.max(-1, Math.min(1, dataArray[idx + 1]));
        }
      }

      dataTexture.needsUpdate = true;
      textMaterial.uniforms.uStrength.value = settings.strength;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Resize
    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      const newAspect = sizes.width / sizes.height;
      const newFrustum = sizes.height;
      camera.left = (newFrustum * newAspect) / -2;
      camera.right = (newFrustum * newAspect) / 2;
      camera.top = newFrustum / 2;
      camera.bottom = newFrustum / -2;
      camera.updateProjectionMatrix();

      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      textTexture.dispose();
      createTextCanvasTexture(currentText, sizes.width, sizes.height, currentTextColor, currentBgColor).then((t) => {
        textTexture = t;
        textMaterial.uniforms.uTexture.value = t;
      });
      textMaterial.uniforms.uResolution.value.set(sizes.width, sizes.height);

      textPlane.geometry.dispose();
      textPlane.geometry = new THREE.PlaneGeometry(sizes.width, sizes.height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      sceneRef.current = null;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      // gui.destroy();
      textPlane.geometry.dispose();
      textMaterial.dispose();
      textTexture.dispose();
      dataTexture.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Plus button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/40 text-white text-2xl flex items-center justify-center hover:bg-white/20 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]"
          style={{ lineHeight: 1 }}
        >
          +
        </button>
      )}

      {/* Expanded panel */}
      {open && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/40 rounded-xl p-6 flex flex-col gap-4 w-80 shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]">
          {/* Text input */}
          <div className="flex flex-col gap-1">
            <label className="text-white/60 text-xs uppercase tracking-widest">Text</label>
            <input
              type="text"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              className="bg-white/10 border border-white/30 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-white/60 transition-colors placeholder-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
            />
          </div>

          {/* Color pickers */}
          <div className="flex gap-3 h-14">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-white/60 text-xs uppercase tracking-widest shrink-0">Text Color</label>
              <input
                type="color"
                value={draftTextColor}
                onChange={(e) => setDraftTextColor(e.target.value)}
                className="w-full flex-1 min-h-0 rounded-xl cursor-pointer p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[10px]"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-white/60 text-xs uppercase tracking-widest shrink-0">BG Color</label>
              <input
                type="color"
                value={draftBgColor}
                onChange={(e) => setDraftBgColor(e.target.value)}
                className="w-full flex-1 min-h-0 rounded-xl cursor-pointer p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[10px]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-2 rounded-xl bg-white/10 border border-white/30 text-white/70 text-sm hover:bg-white/20 hover:text-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-2 rounded-xl bg-white/90 text-black text-sm font-medium hover:bg-white transition-all shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.4)]"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
