"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import galaxyVertexShader from "./shaders/vertex.glsl";
import galaxyFragmentShader from "./shaders/fragment.glsl";

export default function ShaderPatterns() {
  const canvasRef = useRef(null);

  // IMPORTANT
  // we can send a value from the vertext to the fragment shader.
  // those are called **varyings** and the value gets interpolated between the vertices.

  useEffect(() => {
    if (!canvasRef.current) return;

    // Debug UI
    const gui = new GUI({ width: 230, title: "Debug UI" });
    const debugObject = {};

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");

    /**
     * Textures
     */
    const textureLoader = new THREE.TextureLoader();

    /**
     * Galaxy
     */
    const parameters = {};
    parameters.count = 100000;
    parameters.size = 0.005;
    parameters.radius = 5;
    parameters.branches = 3;
    parameters.spin = 1;
    parameters.randomness = 0.5;
    parameters.randomnessPower = 3;
    parameters.insideColor = "#ff6030";
    parameters.outsideColor = "#1b3984";

    let geometry = null;
    let material = null;
    let points = null;

    const generateGalaxy = () => {
      if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
      }

      /**
       * Geometry
       */
      geometry = new THREE.BufferGeometry();

      const positions = new Float32Array(parameters.count * 3);
      const colors = new Float32Array(parameters.count * 3);
      const scales = new Float32Array(parameters.count * 1);
      const randomness = new Float32Array(parameters.count * 3);

      const insideColor = new THREE.Color(parameters.insideColor);
      const outsideColor = new THREE.Color(parameters.outsideColor);

      for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // Position
        const radius = Math.random() * parameters.radius;

        const branchAngle =
          ((i % parameters.branches) / parameters.branches) *
          Math.PI *
          2;

        positions[i3] = Math.cos(branchAngle) * radius;
        positions[i3 + 1] = 0.0;
        positions[i3 + 2] = Math.sin(branchAngle) * radius;

        // Randomness
        const randomX =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius;
        const randomY =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius;
        const randomZ =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1) *
          parameters.randomness *
          radius;

        randomness[i3 + 0] = randomX;
        randomness[i3 + 1] = randomY;
        randomness[i3 + 2] = randomZ;

        // Color
        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor, radius / parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;

        // Scale
        scales[i] = Math.random();
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3)
      );
      geometry.setAttribute(
        "aScale",
        new THREE.BufferAttribute(scales, 1)
      );

      geometry.setAttribute(
        "aRandomness",
        new THREE.BufferAttribute(randomness, 3)
      );

      /**
       * Material
       */
      material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 30.0 * renderer.getPixelRatio() },
        },
      });

      /**
       * Points
       */
      points = new THREE.Points(geometry, material);
      scene.add(points);
    };

    gui
      .add(parameters, "count")
      .min(100)
      .max(1000000)
      .step(100)
      .onFinishChange(generateGalaxy);
    gui
      .add(parameters, "radius")
      .min(0.01)
      .max(20)
      .step(0.01)
      .onFinishChange(generateGalaxy);
    gui
      .add(parameters, "branches")
      .min(2)
      .max(20)
      .step(1)
      .onFinishChange(generateGalaxy);
    gui
      .add(parameters, "randomness")
      .min(0)
      .max(2)
      .step(0.001)
      .onFinishChange(generateGalaxy);
    gui
      .add(parameters, "randomnessPower")
      .min(1)
      .max(10)
      .step(0.001)
      .onFinishChange(generateGalaxy);
    gui
      .addColor(parameters, "insideColor")
      .onFinishChange(generateGalaxy);
    gui
      .addColor(parameters, "outsideColor")
      .onFinishChange(generateGalaxy);

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
    camera.position.set(1, 1, 1);
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

    generateGalaxy();

    // Animate
    let animationFrameId;

    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

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
