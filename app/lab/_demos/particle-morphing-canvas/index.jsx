"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import particlesVertexShader from "./shaders/particles/vertex.glsl";
import particlesFragmentShader from "./shaders/particles/fragment.glsl";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function ParticleMorphingCanvas() {
  const canvasRef = useRef(null);

  // How we will morph from one geometry to another
  // we'll send two sets of positions to the vertex shader
  // the initial shape as position (three.js is expecting one attribute to be named "position")
  // the targeted shape as aPositionTarget

  // then we'll create a uniform: uProgress (from 0 to 1)
  // we use uProgress to mix/interpolate between position and aPositionTarget

  // => we animate uProgress from 0 to 1 to morph the particles from one geometry to another

  useEffect(() => {
    if (!canvasRef.current) return;

    // Debug UI
    const gui = new GUI({ width: 230, title: "Debug UI" });
    gui.domElement.style.position = "fixed";
    gui.domElement.style.bottom = "0";
    gui.domElement.style.left = "0";
    gui.domElement.style.top = "auto";
    gui.domElement.style.right = "auto";
    const debugObject = {};

    // Loaders
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/demos/static/draco/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // Scene
    const scene = new THREE.Scene();

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    };

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(
      35,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(0, 0, 8 * 2);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    debugObject.clearColor = "#160920";
    gui.addColor(debugObject, "clearColor").onChange(() => {
      renderer.setClearColor(debugObject.clearColor);
    });
    renderer.setClearColor(debugObject.clearColor);

    // Resize
    const onResize = () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

      // Materials
      if (particles) {
        particles.material.uniforms.uResolution.value.set(
          sizes.width * sizes.pixelRatio,
          sizes.height * sizes.pixelRatio
        );
      }

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(sizes.pixelRatio);
    };
    window.addEventListener("resize", onResize);

    /**
     * Particles
     */
    let particles = null;
    // Load models
    gltfLoader.load("/demos/static/models.glb", (gltf) => {
      particles = {};

      // extract positions from the model
      const positions = gltf.scene.children.map(
        (child) => child.geometry.attributes.position
      );

      particles.maxCount = 0;
      for (const position of positions) {
        if (position.count > particles.maxCount) {
          particles.maxCount = position.count;
        }
      }

      particles.positions = [];

      for (const position of positions) {
        const originalArray = position.array;
        const newArray = new Float32Array(particles.maxCount * 3); // x, y, z for each vertex

        for (let i = 0; i < particles.maxCount; i++) {
          const i3 = i * 3;

          if (i3 < originalArray.length) {
            newArray[i3 + 0] = originalArray[i3 + 0];
            newArray[i3 + 1] = originalArray[i3 + 1];
            newArray[i3 + 2] = originalArray[i3 + 2];
          } else {
            const randomIndex = Math.floor(position.count * Math.random()) * 3;
            newArray[i3 + 0] = originalArray[randomIndex + 0];
            newArray[i3 + 1] = originalArray[randomIndex + 1];
            newArray[i3 + 2] = originalArray[randomIndex + 2];
          }
        }

        particles.positions.push(new THREE.Float32BufferAttribute(newArray, 3));
      }


      // Geometry
      particles.geometry = new THREE.BufferGeometry();
      particles.geometry.setAttribute("position", particles.positions[1]);
      particles.geometry.setAttribute("aPositionTarget", particles.positions[3]);
      // particles.geometry.setIndex(null); vertices are unique so no need for index

      // Material
      const pixelRatio = renderer.getPixelRatio();
      particles.material = new THREE.ShaderMaterial({
        vertexShader: particlesVertexShader,
        fragmentShader: particlesFragmentShader,
        uniforms: {
          uSize: new THREE.Uniform(0.2),
          uResolution: new THREE.Uniform(
            new THREE.Vector2(
              sizes.width * pixelRatio,
              sizes.height * pixelRatio
            )
          ),
          uProgress: new THREE.Uniform(0),
        },
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      // Points
      particles.points = new THREE.Points(
        particles.geometry,
        particles.material
      );
      scene.add(particles.points);

      // Tweaks
      gui.add(particles.material.uniforms.uProgress, "value").min(0).max(1).step(0.001).name("uProgress");

    });

    // Animate
    let animationFrameId;

    const tick = () => {
      // Update controls
      controls.update();

      // Render normal scene
      renderer.render(scene, camera);

      // Call tick again on the next frame
      animationFrameId = window.requestAnimationFrame(tick);
    };

    // Start animation
    tick();

    // Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      gui.destroy();
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
