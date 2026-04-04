"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import GUI from "lil-gui";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

/**
 * Creates a soft radial gradient brush texture via canvas.
 * White center fading to transparent edges — used as displacement brush.
 */
function createBrushTexture(size = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates a high-resolution canvas texture with centered text.
 * Renders at 2x device pixel ratio for crisp text.
 */
function createTextCanvasTexture(text, width, height) {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const canvas = document.createElement("canvas");
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Calculate font size to fill ~80% of viewport width
  let fontSize = Math.min(width * 0.12, 200);
  ctx.font = `bold ${fontSize}px PPNeueMontreal Medium, sans-serif`;
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Measure and scale down if too wide
  let metrics = ctx.measureText(text);
  while (metrics.width > width * 0.85 && fontSize > 20) {
    fontSize -= 2;
    ctx.font = `bold ${fontSize}px PPNeueMontreal Medium, sans-serif`;
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

  useEffect(() => {
    if (!containerRef.current) return;

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Settings
    const settings = {
      strength: 0.08,
      brushSize: 50,
      fadeSpeed: 0.93,
      growSpeed: 0.05,
    };

    // --- Scenes ---
    // Brush scene: renders displacement brushes to an offscreen FBO
    const brushScene = new THREE.Scene();
    // Main scene: renders the text plane with displacement
    const mainScene = new THREE.Scene();

    // Orthographic camera (pixel space, origin at center)
    const frustumSize = sizes.height;
    const aspect = sizes.width / sizes.height;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      -1000,
      1000
    );
    camera.position.set(0, 0, 2);

    // Renderer — alpha: false prevents page content from bleeding through the canvas
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);

    // Render target for displacement (full resolution = smooth)
    let renderTarget = new THREE.WebGLRenderTarget(sizes.width, sizes.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });

    // --- Brush pool ---
    const brushTexture = createBrushTexture(128);
    const brushGeometry = new THREE.PlaneGeometry(1, 1);
    const maxBrushes = 80;
    const brushes = [];

    for (let i = 0; i < maxBrushes; i++) {
      const material = new THREE.MeshBasicMaterial({
        map: brushTexture,
        transparent: true,
        blending: THREE.NormalBlending,
        depthTest: false,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(brushGeometry, material);
      mesh.visible = false;
      mesh.rotation.z = Math.random() * Math.PI * 2;
      brushScene.add(mesh);
      brushes.push(mesh);
    }

    let currentBrush = 0;

    // --- Text plane ---
    const textTexture = createTextCanvasTexture("DISTORTION", sizes.width, sizes.height);

    const textMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: textTexture },
        uDisplacement: { value: null },
        uResolution: { value: new THREE.Vector2(sizes.width, sizes.height) },
        uStrength: { value: settings.strength },
      },
    });

    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(sizes.width, sizes.height),
      textMaterial
    );
    mainScene.add(textPlane);

    // --- Mouse tracking ---
    const mouse = new THREE.Vector2(0, 0);
    const prevMouse = new THREE.Vector2(0, 0);

    const handleMouseMove = (e) => {
      mouse.x = e.clientX - sizes.width / 2;
      mouse.y = sizes.height / 2 - e.clientY;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        mouse.x = e.touches[0].clientX - sizes.width / 2;
        mouse.y = sizes.height / 2 - e.touches[0].clientY;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    const spawnBrush = (x, y, dx, dy) => {
      const mesh = brushes[currentBrush];
      mesh.visible = true;
      mesh.position.x = x;
      mesh.position.y = y;
      mesh.material.opacity = 1;
      mesh.scale.set(settings.brushSize, settings.brushSize, 1);

      // Encode velocity direction into brush color
      // 0.5 = neutral (no displacement), 0/1 = full negative/positive
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      mesh.material.color.setRGB(
        dx / len * 0.5 + 0.5,
        dy / len * 0.5 + 0.5,
        0.5
      );

      currentBrush = (currentBrush + 1) % maxBrushes;
    };

    const trackMouse = () => {
      const dx = mouse.x - prevMouse.x;
      const dy = mouse.y - prevMouse.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        spawnBrush(mouse.x, mouse.y, dx, dy);
      }
      prevMouse.x = mouse.x;
      prevMouse.y = mouse.y;
    };

    // --- GUI ---
    const gui = new GUI({ width: 300, title: "Text Distortion" });
    gui.domElement.style.position = "absolute";
    gui.domElement.style.bottom = "0";
    gui.domElement.style.left = "0";
    gui.domElement.style.top = "auto";
    gui.domElement.style.right = "auto";

    gui.add(settings, "strength", 0.01, 0.3, 0.005).name("Strength");
    gui.add(settings, "brushSize", 20, 200, 1).name("Brush Size");
    gui.add(settings, "fadeSpeed", 0.9, 0.99, 0.005).name("Fade Speed");

    // --- Animation loop ---
    const animate = () => {
      trackMouse();

      // Update brush animations
      brushes.forEach((mesh) => {
        if (mesh.visible) {
          mesh.rotation.z += 0.01;
          mesh.material.opacity *= settings.fadeSpeed;
          // Gentle growth for organic feel
          mesh.scale.x = 0.982 * mesh.scale.x + settings.growSpeed * settings.brushSize;
          mesh.scale.y = mesh.scale.x;

          if (mesh.material.opacity < 0.002) {
            mesh.visible = false;
          }
        }
      });

      // Render brushes to FBO (gray = neutral, 0.5 decodes to zero displacement)
      renderer.setClearColor(0x808080, 1);
      renderer.setRenderTarget(renderTarget);
      renderer.clear();
      renderer.render(brushScene, camera);

      // Pass displacement to text material
      textMaterial.uniforms.uDisplacement.value = renderTarget.texture;
      textMaterial.uniforms.uStrength.value = settings.strength;

      // Render main scene
      renderer.setClearColor(0xffffff, 1);
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(mainScene, camera);

      requestAnimationFrame(animate);
    };

    animate();

    // --- Resize ---
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
      renderTarget.setSize(sizes.width, sizes.height);

      // Recreate text texture at new resolution
      textTexture.dispose();
      const newTextTexture = createTextCanvasTexture("DISTORTION", sizes.width, sizes.height);
      textMaterial.uniforms.uTexture.value = newTextTexture;
      textMaterial.uniforms.uResolution.value.set(sizes.width, sizes.height);

      // Update text plane geometry
      textPlane.geometry.dispose();
      textPlane.geometry = new THREE.PlaneGeometry(sizes.width, sizes.height);
    };

    window.addEventListener("resize", handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      gui.destroy();
      brushGeometry.dispose();
      brushTexture.dispose();
      brushes.forEach((b) => b.material.dispose());
      textPlane.geometry.dispose();
      textMaterial.dispose();
      textTexture.dispose();
      renderTarget.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="fixed top-0 left-0 w-full h-full" />;
}
