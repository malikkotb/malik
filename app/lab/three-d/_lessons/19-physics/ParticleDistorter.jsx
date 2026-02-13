"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import GUI from "lil-gui";
import { Timer } from "three/src/core/Timer.js";
import { SphereGeometry } from "three/src/geometries/SphereGeometry.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";

export default function ParticleDistorter() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene
    const scene = new THREE.Scene();

    /* Textures */
    // Image textures
    const textureLoader = new THREE.TextureLoader();

    /*
     * Galaxy
     */

    // Debug UI
    const gui = new GUI({ width: 300, title: "Debug UI" });

    const parameters = {};
    parameters.count = 100000;
    parameters.size = 0.01;
    parameters.radius = 5;
    parameters.branches = 3;
    parameters.spin = 1;
    parameters.randomness = 0.2;
    parameters.randomnessPower = 3;
    parameters.insideColor = "#ff6030";
    parameters.outsideColor = "#1b3984";

    // Hover effect parameters
    parameters.hoverStrength = 0.8; // Increased for better visibility with smooth falloff
    parameters.returnSpeed = 0.1; // Speed at which particles return
    parameters.dampening = 0.85; // Dampening factor for smooth motion

    // Setup for mouse interaction
    const mouse = new THREE.Vector2();
    const mouseWorldPos = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // XZ plane at y=0

    // Track mouse position
    const onMouseMove = (event) => {
      // Get mouse position in normalized device coordinates (-1 to +1)
      mouse.x = (event.clientX / sizes.width) * 2 - 1;
      mouse.y = -((event.clientY / sizes.height) * 2 - 1);

      // Update the raycaster
      raycaster.setFromCamera(mouse, camera);

      // Calculate the point where the ray intersects the plane
      raycaster.ray.intersectPlane(plane, mouseWorldPos);
    };
    window.addEventListener("mousemove", onMouseMove);

    let geometry = null;
    let material = null;
    let points = null;

    const generateGalaxy = () => {
      /* Destroy old galaxy */
      // to avoid memory leaks
      if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
      }

      // Geometry
      geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(parameters.count * 3); // x, y, z
      const originalPositions = new Float32Array(
        parameters.count * 3
      ); // Store original positions
      const velocities = new Float32Array(parameters.count * 3); // Store velocities
      const colors = new Float32Array(parameters.count * 3); // r, g, b

      const insideColor = new THREE.Color(parameters.insideColor);
      const outsideColor = new THREE.Color(parameters.outsideColor);

      // Fill positions array with random coordinates
      for (let i = 0; i < parameters.count; i++) {
        // Position
        const i3 = i * 3;

        const radius = Math.random() * parameters.radius;
        const branchAngle =
          ((i % parameters.branches) / parameters.branches) *
          Math.PI *
          2;
        const spinAngle = radius * parameters.spin;

        const randomX =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1);
        const randomY =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1);
        const randomZ =
          Math.pow(Math.random(), parameters.randomnessPower) *
          (Math.random() < 0.5 ? 1 : -1);

        const x =
          Math.cos(branchAngle + spinAngle) * radius + randomX;
        const y = 0 + randomY;
        const z =
          Math.sin(branchAngle + spinAngle) * radius + randomZ;

        positions[i3 + 0] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;

        // Store original positions
        originalPositions[i3 + 0] = x;
        originalPositions[i3 + 1] = y;
        originalPositions[i3 + 2] = z;

        // Color
        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor, radius / parameters.radius);
        colors[i3 + 0] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
      }

      // Add positions attribute to geometry
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3)
      );

      // Store original positions and velocities as separate attributes
      geometry.setAttribute(
        "originalPosition",
        new THREE.BufferAttribute(originalPositions, 3)
      );
      geometry.setAttribute(
        "velocity",
        new THREE.BufferAttribute(velocities, 3)
      );

      // Material
      material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
      });

      // Points
      points = new THREE.Points(geometry, material);
      scene.add(points);
    };

    generateGalaxy();

    // Add particle size control to debug UI
    gui
      .add(parameters, "size")
      .min(0.001)
      .max(0.1)
      .step(0.001)
      .onFinishChange(() => {
        generateGalaxy();
      });

    // Add particle count control to debug UI
    gui
      .add(parameters, "count")
      .min(100)
      .max(1000000)
      .step(100)
      .onFinishChange(() => {
        generateGalaxy();
      });

    gui
      .add(parameters, "radius")
      .min(0.01)
      .max(20)
      .step(0.1)
      .onFinishChange(() => {
        generateGalaxy();
      });

    gui
      .add(parameters, "branches")
      .min(2)
      .max(20)
      .step(1)
      .onFinishChange(() => {
        generateGalaxy();
      });

    gui
      .add(parameters, "spin")
      .min(-5)
      .max(5)
      .step(0.001)
      .onFinishChange(() => {
        generateGalaxy();
      });

    gui
      .add(parameters, "randomness")
      .min(0)
      .max(2)
      .step(0.001)
      .onFinishChange(() => {
        generateGalaxy();
      });

    gui
      .add(parameters, "randomnessPower")
      .min(1)
      .max(10)
      .step(0.001)
      .onFinishChange(() => {
        generateGalaxy();
      });
    gui.addColor(parameters, "insideColor").onFinishChange(() => {
      generateGalaxy();
    });
    gui.addColor(parameters, "outsideColor").onFinishChange(() => {
      generateGalaxy();
    });

    // Hover effect controls
    const hoverFolder = gui.addFolder("Hover Effect");
    hoverFolder
      .add(parameters, "hoverStrength")
      .min(0)
      .max(2)
      .step(0.1)
      .name("Effect Strength");
    hoverFolder
      .add(parameters, "returnSpeed")
      .min(0.01)
      .max(0.5)
      .step(0.01)
      .name("Return Speed");
    hoverFolder
      .add(parameters, "dampening")
      .min(0.5)
      .max(0.99)
      .step(0.01)
      .name("Smoothness");

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /**
     * Lights
     */
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
    directionalLight.position.set(1, 2, 0);
    scene.add(directionalLight);

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
    camera.position.x = 0;
    camera.position.y = 6;
    camera.position.z = 0;

    // Rotate camera to look down at the galaxy
    camera.rotation.x = -Math.PI / 2; // Rotate -90 degrees around X axis to point downward
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });

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
    const timer = new Timer();
    let animationFrameId;

    const tick = () => {
      timer.update();
      const elapsedTime = timer.getElapsed();

        // Update particle positions based on mouse hover and spring motion
        const positions = points.geometry.attributes.position.array;
        const originalPositions = points.geometry.attributes.originalPosition.array;
        const velocities = points.geometry.attributes.velocity.array;

        for (let i = 0; i < parameters.count; i++) {
          const i3 = i * 3;

          // Get the distance between particle and mouse
          const particleX = positions[i3];
          const particleZ = positions[i3 + 2];
          const dx = particleX - mouseWorldPos.x;
          const dz = particleZ - mouseWorldPos.z;
          const distance = Math.sqrt(dx * dx + dz * dz);

          // Calculate smooth falloff based on distance
          const falloff = Math.exp(-distance * distance * 2); // Gaussian falloff
          const factor = falloff * parameters.hoverStrength;

          // Calculate target position (where the particle wants to go)
          const targetX = factor > 0.01 
            ? originalPositions[i3] + (mouseWorldPos.x - originalPositions[i3]) * factor 
            : originalPositions[i3];
          const targetZ = factor > 0.01
            ? originalPositions[i3 + 2] + (mouseWorldPos.z - originalPositions[i3 + 2]) * factor
            : originalPositions[i3 + 2];

          // Calculate spring force
          const springX = (targetX - positions[i3]) * parameters.returnSpeed;
          const springZ = (targetZ - positions[i3 + 2]) * parameters.returnSpeed;

          // Update velocities with spring force
          velocities[i3] = velocities[i3] * parameters.dampening + springX;
          velocities[i3 + 2] = velocities[i3 + 2] * parameters.dampening + springZ;

          // Update positions using velocities
          positions[i3] += velocities[i3];
          positions[i3 + 1] = originalPositions[i3 + 1]; // Keep Y position
          positions[i3 + 2] += velocities[i3 + 2];
        }

        points.geometry.attributes.position.needsUpdate = true;
        points.geometry.attributes.velocity.needsUpdate = true;

      // Render
      renderer.render(scene, camera);

      animationFrameId = window.requestAnimationFrame(tick);
    };

    // call tick again on the next frame
    tick();

    // Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className='h-screen w-screen fixed top-0 left-0'>
      <canvas ref={canvasRef} className='webgl' />
    </div>
  );
}
