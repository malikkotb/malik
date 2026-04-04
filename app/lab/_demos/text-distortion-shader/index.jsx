"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import GUI from "lil-gui";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

/**
 * Creates a high-resolution canvas texture with centered text.
 */
function createTextCanvasTexture(text, width, height) {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const canvas = document.createElement("canvas");
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  let fontSize = Math.min(width * 0.12, 200);
  ctx.font = `bold ${fontSize}px PPNeueMontreal Medium, sans-serif`;
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

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

    const settings = {
      strength: 0.08,
      relaxation: 0.965,
      brushRadius: 0.045,
    };

    // --- Data texture (velocity field grid) ---
    const gridSize = 128;
    const dataArray = new Float32Array(gridSize * gridSize * 4); // RGBA per cell
    let dataTexture = new THREE.DataTexture(
      dataArray,
      gridSize,
      gridSize,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    dataTexture.magFilter = THREE.LinearFilter;
    dataTexture.minFilter = THREE.LinearFilter;
    dataTexture.needsUpdate = true;

    // --- Scene ---
    const scene = new THREE.Scene();

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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);

    // --- Text plane ---
    let textTexture = createTextCanvasTexture("DISTORTION", sizes.width, sizes.height);

    const textMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: textTexture },
        uDataTexture: { value: dataTexture },
        uResolution: { value: new THREE.Vector2(sizes.width, sizes.height) },
        uStrength: { value: settings.strength },
      },
    });

    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(sizes.width, sizes.height),
      textMaterial
    );
    scene.add(textPlane);

    // --- Mouse tracking ---
    const mouse = { x: 0, y: 0 };
    const prevMouse = { x: 0, y: 0 };
    let mouseInitialized = false;

    const handleMouseMove = (e) => {
      if (!mouseInitialized) {
        prevMouse.x = e.clientX / sizes.width;
        prevMouse.y = e.clientY / sizes.height;
        mouseInitialized = true;
      }
      mouse.x = e.clientX / sizes.width;
      mouse.y = e.clientY / sizes.height;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        const tx = e.touches[0].clientX / sizes.width;
        const ty = e.touches[0].clientY / sizes.height;
        if (!mouseInitialized) {
          prevMouse.x = tx;
          prevMouse.y = ty;
          mouseInitialized = true;
        }
        mouse.x = tx;
        mouse.y = ty;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    // --- GUI ---
    const gui = new GUI({ width: 300, title: "Text Distortion" });
    gui.domElement.style.position = "absolute";
    gui.domElement.style.bottom = "0";
    gui.domElement.style.left = "0";
    gui.domElement.style.top = "auto";
    gui.domElement.style.right = "auto";

    gui.add(settings, "strength", 0.01, 0.2, 0.005).name("Strength");
    gui.add(settings, "relaxation", 0.92, 0.995, 0.001).name("Relaxation");
    gui.add(settings, "brushRadius", 0.02, 0.1, 0.005).name("Brush Radius");

    // --- Animation loop ---
    const animate = () => {
      // Compute mouse velocity in normalized coords
      const vx = mouse.x - prevMouse.x;
      const vy = mouse.y - prevMouse.y;
      prevMouse.x = mouse.x;
      prevMouse.y = mouse.y;

      const brushRadius = settings.brushRadius;
      const relaxation = settings.relaxation;

      // Update data texture cells
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const idx = (i * gridSize + j) * 4;

          // Cell center in normalized coords [0,1]
          const cellX = (j + 0.5) / gridSize;
          const cellY = (i + 0.5) / gridSize;

          // Distance from mouse (flip mouse Y to match UV space)
          const dx = cellX - mouse.x;
          const dy = cellY - (1.0 - mouse.y);
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Smooth radial falloff
          if (dist < brushRadius) {
            const influence = 1.0 - dist / brushRadius;
            const smooth = influence * influence * (3.0 - 2.0 * influence); // smoothstep

            // Write velocity into RG, scaled by influence
            // Negate vy because screen Y is inverted vs UV Y
            dataArray[idx] += vx * smooth * 20;
            dataArray[idx + 1] += -vy * smooth * 20;
          }

          // Relax all cells toward zero (gooey spring-back)
          dataArray[idx] *= relaxation;
          dataArray[idx + 1] *= relaxation;

          // Clamp to prevent extreme values
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

      textTexture.dispose();
      textTexture = createTextCanvasTexture("DISTORTION", sizes.width, sizes.height);
      textMaterial.uniforms.uTexture.value = textTexture;
      textMaterial.uniforms.uResolution.value.set(sizes.width, sizes.height);

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
      textPlane.geometry.dispose();
      textMaterial.dispose();
      textTexture.dispose();
      dataTexture.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="fixed top-0 left-0 w-full h-full" />;
}
