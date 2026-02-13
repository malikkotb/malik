"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

export default function ShaderPatterns() {
  const canvasRef = useRef(null);

  // IMPORTANT
  // we can send a value from the vertext to the fragment shader.
  // those are called **varyings** and the value gets interpolated between the vertices.

  useEffect(() => {
    if (!canvasRef.current) return;

    // Debug UI
    const gui = new GUI({ width: 230, title: "Debug UI" });

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");

    /**
     * Textures
     */
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/demos/image.avif");

    /**
     * Test mesh
     */
    // Geometry
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);


    // Material 
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
      },
    });

    // Mesh
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    /**
     * Lights
     */
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
    scene.add(ambientLight);

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(0.25, -0.25, 1);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Resize
    const onResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", onResize);

    // Animate
    let animationFrameId;

    const clock = new THREE.Clock();
    let oldElapsedTime = 0;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update time uniform for pulsing animation
      material.uniforms.uTime.value = elapsedTime;

      // update controls
      controls.update();

      // Render
      renderer.render(scene, camera);

      animationFrameId = window.requestAnimationFrame(tick);
    };

    // call tick again on the next frame
    tick();

    // Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  return (
    <div className=''>
      <canvas
        ref={canvasRef}
        className='fixed top-0 left-0 w-full h-full outline-none'
      />
    </div>
  );
}
