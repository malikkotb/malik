"use client";
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function BulgeDistortionAnimation() {
  const mountRef = useRef();
  const cursorRef = useRef();

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem(
      "bulge-distortion-reloaded"
    );
    if (!hasReloaded) {
      sessionStorage.setItem("bulge-distortion-reloaded", "true");
      window.location.reload();
      return;
    }
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear any existing canvas elements
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      100
    );
    camera.position.z = 2.25;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    // renderer.setClearColor(0xffffff, 1); // Set white background
    mountRef.current.appendChild(renderer.domElement);

    // Plane geometry
    // more subdivions for a smoother effect (256)
    // const geometry = new THREE.PlaneGeometry(0.8, 1, 256, 256);
    const geometry = new THREE.PlaneGeometry(1, 1, 128, 128);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/square.png");

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uTexture: { value: texture },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uStrength: { value: 0.4 },
        uRadius: { value: 0.35 }, // Radius of influence for the bulge
      },
      vertexShader: `
        uniform vec2 uMouse;
        uniform float uStrength;
        uniform float uRadius;
        varying vec2 vUv;

        void main() {
          vUv = uv;
          vec3 pos = position;
          
          // Calculate distance from mouse in UV space
          float dist = distance(uv, uMouse);
          
          // Gaussian-like falloff for smoother bulge
          float influence = exp(-dist * dist / (uRadius * uRadius));
          
          // Create smooth bulge
          pos.z += influence * uStrength;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec2 vUv;

        void main() {
          gl_FragColor = texture2D(uTexture, vUv);
        }
      `,
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // // --- Raycaster for accurate mouse UV ---
    // const raycaster = new THREE.Raycaster();
    // const mouseNDC = new THREE.Vector2();

    // function onMouseMove(e) {
    //   const rect = renderer.domElement.getBoundingClientRect();

    //   // Convert mouse to Normalized Device Coordinates (-1 to 1)
    //   mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    //   mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    //   // Cast a ray from camera into scene
    //   raycaster.setFromCamera(mouseNDC, camera);

    //   // Intersect with the plane
    //   const intersects = raycaster.intersectObject(plane);
    //   if (intersects.length > 0) {
    //     const uv = intersects[0].uv; // <-- This is the correct UV beneath cursor
    //     material.uniforms.uMouse.value.copy(uv);
    //   }
    // }

    // --- Mouse to UV mapping (canvas-wide) ---
    const mouse = new THREE.Vector2(0.5, 0.5);

    function onMouseMove(e) {
      const rect = renderer.domElement.getBoundingClientRect();

      // Normalize mouse to 0–1 across the canvas
      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = 1 - (e.clientY - rect.top) / rect.height; // flip Y for UV space

      // Update uniform (even if not hovering the plane)
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);
    }

    window.addEventListener("mousemove", onMouseMove);

    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("mousemove", onMouseMove);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, []);

  return (
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
  );
}
