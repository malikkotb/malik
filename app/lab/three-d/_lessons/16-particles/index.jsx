"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import { Timer } from "three/src/core/Timer.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";

export default function Particles() {
  const canvasRef = useRef(null);
  const debugObject = {};

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene
    const scene = new THREE.Scene();

    /* Textures */
    const textureLoader = new THREE.TextureLoader();
    const particleTexture = textureLoader.load(
      "/demos/textures/particles/2.png"
    );

    // Debug UI
    const gui = new GUI({ width: 260, title: "Debug UI" });

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /* Particles */
    // Particles can be used to create effects like stars, rain, dust,smoke, fire, etc.
    // u can have thousands of them with a reasonable frame rate
    // each particle is composed of a plane (two triagnles) always facing the camera
    // Creating particles in three.js is like creating a mesh
    // - a geometry (BufferGeometry)
    // - a material (PointsMaterial)
    // - a Points instance (instead of a Mesh)

    // Particles geometry
    const particlesGeometry = new BufferGeometry(1, 32, 32);
    const count = 5000;

    const positions = new Float32Array(count * 3); // x, y, z
    const colors = new Float32Array(count * 3); // r, g, b

    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
      colors[i] = Math.random(); // 0-1 (r,g,b all go from 0 to 1)
    }

    // to have control over each particle, -> we change the attributes in the buffer array

    // the array "positions" in the BufferAttribute is the array that contains the positions of all the particles
    // we can update each vertex separately in particlesGeometry.attributes.position.array
    // because that array contains all the positions of all the particles
    // it is 1-dimenionsal, so we have to go 3 by 3 (so if we want to update the position of the first particle, we have to update the first 3 values in the array)

    // Set the position attribute for each particle in the geometry
    // The BufferAttribute takes the positions array and 3 indicates each position uses 3 values (x,y,z)
    // This tells Three.js where to place each particle in 3D space
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );

    // Particles material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      depthWrite: false,
      // color: "#ff69b4",
      transparent: true,
      alphaMap: particleTexture,
      // alphaTest: 0.001,
      // depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    // Points
    const particles = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particles);

    // different colors for each particle

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
    camera.position.x = 4;
    camera.position.y = 2;
    camera.position.z = 5;
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

      // update all particles at once
      // particles.rotation.y = 0.2 * elapsedTime;

      // update individual particles
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // i3 + 0 is the x coordinate
        // i3 + 1 is the y coordinate
        // i3 + 2 is the z coordinate
        // this is really expensive way of animating it for the GPU
        // instead of using a Pointsmaterial, we should use a custom shader
        const x = particlesGeometry.attributes.position.array[i3 + 0];
        particlesGeometry.attributes.position.array[i3 + 1] =
          Math.sin(elapsedTime + x);
      }
      // need to tell three.js that attributes will update
      particlesGeometry.attributes.position.needsUpdate = true;

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
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className='webgl' />;
}
