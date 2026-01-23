"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import waterVertexShader from "./shaders/water/vertex.glsl";
import waterFragmentShader from "./shaders/water/fragment.glsl";

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
    // const texture = textureLoader.load("/demos/image.avif");

    // Geometry
    const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512);

    // Color
    debugObject.depthColor = "#186691";
    debugObject.surfaceColor = "#9bd8ff";

    // Material
    const waterMaterial = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: {
        uTime: { value: 0 },

        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 0.75 },

        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallWavesIterations: { value: 4 },

        uDepthColor: {
          value: new THREE.Color(debugObject.depthColor),
        },
        uSurfaceColor: {
          value: new THREE.Color(debugObject.surfaceColor),
        },
        uColorOffset: { value: 0.08 },
        uColorMultiplier: { value: 5.0 },
      },
    });

    // Debug UI
    gui
      .add(waterMaterial.uniforms.uBigWavesElevation, "value")
      .min(0)
      .max(1)
      .step(0.001)
      .name("uBigWavesElevation");

    gui
      .add(waterMaterial.uniforms.uBigWavesFrequency.value, "x")
      .min(0)
      .max(20)
      .step(0.01)
      .name("uBigWavesFrequencyX");
    gui
      .add(waterMaterial.uniforms.uBigWavesFrequency.value, "y") // this is "z" in the vertex shader
      .min(0)
      .max(20)
      .step(0.01)
      .name("uBigWavesFrequencyY");
    gui
      .add(waterMaterial.uniforms.uBigWavesSpeed, "value")
      .min(0)
      .max(2)
      .step(0.01)
      .name("uBigWavesSpeed");

    gui.add(waterMaterial.uniforms.uSmallWavesElevation, "value")
      .min(0)
      .max(1)
      .step(0.01)
      .name("uSmallWavesElevation");
    gui.add(waterMaterial.uniforms.uSmallWavesFrequency, "value")
      .min(0)
      .max(30)
      .step(0.01)
      .name("uSmallWavesFrequency");
    gui.add(waterMaterial.uniforms.uSmallWavesSpeed, "value")
      .min(0)
      .max(4)
      .step(0.01)
      .name("uSmallWavesSpeed");
    gui.add(waterMaterial.uniforms.uSmallWavesIterations, "value")
      .min(0)
      .max(5)
      .step(1)
      .name("uSmallWavesIterations");

    gui.addColor(debugObject, "depthColor").onChange(() => {
      waterMaterial.uniforms.uDepthColor.value.set(
        debugObject.depthColor
      );
    });
    gui.addColor(debugObject, "surfaceColor").onChange(() => {
      waterMaterial.uniforms.uSurfaceColor.value.set(
        debugObject.surfaceColor
      );
    });
    gui.add(waterMaterial.uniforms.uColorOffset, "value")
      .min(0)
      .max(1)
      .step(0.01)
      .name("uColorOffset");
    gui.add(waterMaterial.uniforms.uColorMultiplier, "value")
      .min(0)
      .max(10)
      .step(0.01)
      .name("uColorMultiplier");

    // Mesh
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

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

    // Animate
    let animationFrameId;

    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update water
      waterMaterial.uniforms.uTime.value = elapsedTime;

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
