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

export default function TextHoverDistortion() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const settings = {
      strength: 15.0,
      radius: 0.25,
      ease: 0.08,
    };

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

    const textTexture = createTextCanvasTexture("DISTORTION", sizes.width, sizes.height);

    const textMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: textTexture },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uVelocity: { value: new THREE.Vector2(0, 0) },
        uResolution: { value: new THREE.Vector2(sizes.width, sizes.height) },
        uStrength: { value: settings.strength },
        uRadius: { value: settings.radius },
      },
    });

    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(sizes.width, sizes.height),
      textMaterial
    );
    scene.add(textPlane);

    // Mouse tracking with eased position and velocity
    const mouse = { x: 0, y: 0 };
    const smoothMouse = { x: 0, y: 0 };
    const prevSmooth = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    // GUI
    const gui = new GUI({ width: 300, title: "Text Hover Distortion" });
    gui.domElement.style.position = "absolute";
    gui.domElement.style.bottom = "0";
    gui.domElement.style.left = "0";
    gui.domElement.style.top = "auto";
    gui.domElement.style.right = "auto";

    gui.add(settings, "strength", 1.0, 40.0, 0.5).name("Strength");
    gui.add(settings, "radius", 0.05, 0.6, 0.01).name("Radius");
    gui.add(settings, "ease", 0.01, 0.2, 0.005).name("Ease");

    // Animation loop
    const animate = () => {
      // Ease mouse position for smooth movement
      smoothMouse.x += (mouse.x - smoothMouse.x) * settings.ease;
      smoothMouse.y += (mouse.y - smoothMouse.y) * settings.ease;

      // Velocity = difference between current and previous eased position
      const vx = smoothMouse.x - prevSmooth.x;
      const vy = smoothMouse.y - prevSmooth.y;

      prevSmooth.x = smoothMouse.x;
      prevSmooth.y = smoothMouse.y;

      // Pass mouse in pixel coords (fragment shader converts to UV)
      textMaterial.uniforms.uMouse.value.set(smoothMouse.x, smoothMouse.y);

      // Pass velocity in UV space (pixels / resolution), flip Y for GL coords
      textMaterial.uniforms.uVelocity.value.set(
        vx / sizes.width,
        -vy / sizes.height
      );

      textMaterial.uniforms.uStrength.value = settings.strength;
      textMaterial.uniforms.uRadius.value = settings.radius;

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
      const newTextTexture = createTextCanvasTexture("DISTORTION", sizes.width, sizes.height);
      textMaterial.uniforms.uTexture.value = newTextTexture;
      textMaterial.uniforms.uResolution.value.set(sizes.width, sizes.height);

      textPlane.geometry.dispose();
      textPlane.geometry = new THREE.PlaneGeometry(sizes.width, sizes.height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      gui.destroy();
      textPlane.geometry.dispose();
      textMaterial.dispose();
      textTexture.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="fixed top-0 left-0 w-full h-full" />;
}
