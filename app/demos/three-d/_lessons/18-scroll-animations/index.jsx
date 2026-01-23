"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import GUI from "lil-gui";
import { Timer } from "three/src/core/Timer.js";

export default function ScrollAnimations() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene
    const scene = new THREE.Scene();

    /* Textures */
    // Image textures
    const textureLoader = new THREE.TextureLoader();
    const gradientTexture = textureLoader.load(
      "/demos/textures/gradients/3.avif"
    );
    gradientTexture.magFilter = THREE.NearestFilter;

    // Debug UI
    const gui = new GUI({ width: 300, title: "Debug UI" });

    const parameters = {
      materialColor: "#ffeded",
    };

    gui.addColor(parameters, "materialColor").onChange(() => {
      material.color.set(parameters.materialColor);
      particlesMaterial.color.set(parameters.materialColor);
    });

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /* Objects */

    /* Materials */
    const material = new THREE.MeshToonMaterial({
      color: parameters.materialColor,
      gradientMap: gradientTexture,
    });

    /* Meshes */
    const objectsDistance = 4;
    4;
    const mesh1 = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.4, 16, 60),
      material
    );

    const mesh2 = new THREE.Mesh(
      new THREE.ConeGeometry(1, 2, 32),
      material
    );

    const mesh3 = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
      material
    );

    mesh1.position.y = -objectsDistance * 0;
    mesh2.position.y = -objectsDistance * 1;
    mesh3.position.y = -objectsDistance * 2;

    mesh1.position.x = 2;
    mesh2.position.x = -2;
    mesh3.position.x = 2;

    scene.add(mesh1, mesh2, mesh3);

    const sectionMeshes = [mesh1, mesh2, mesh3];

    /**
     * Particles
     */
    const particlesCount = 200;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] =
        objectsDistance * 0.5 -
        Math.random() * objectsDistance * sectionMeshes.length;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
      color: parameters.materialColor,
      sizeAttenuation: true,
      size: 0.03,
    });

    // Points
    const particles = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particles);

    /**
     * Lights
     */
    const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
    directionalLight.position.set(1, 1, 0);
    scene.add(directionalLight);

    /**
     * Camera
     */

    // Group
    const cameraGroup = new THREE.Group();
    scene.add(cameraGroup);

    // Base camera
    const camera = new THREE.PerspectiveCamera(
      35,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.z = 6;
    cameraGroup.add(camera);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
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

    /* Scroll */
    let scrollY = window.scrollY;
    let currentSection = 0;

    window.addEventListener("scroll", () => {
      scrollY = window.scrollY;
      const newSection = Math.round(scrollY / sizes.height);

      if (newSection !== currentSection) {
        currentSection = newSection;
        gsap.to(sectionMeshes[currentSection].rotation, {
          duration: 1.5,
          ease: "power2.inOut",
          x: "+=6",
          y: "+=3",
          z: "+=1.5",
        });
      }
    });

    /* Parallax */
    // action of seeing one object through differnt observation points
    // we're going to apply a parallax effect by making the camera move horizontally and vertically
    // according to the mouse position

    /* Cursor */
    const cursor = {
      x: 0,
      y: 0,
    };
    window.addEventListener("mousemove", (event) => {
      cursor.x = event.clientX / sizes.width - 0.5;
      cursor.y = event.clientY / sizes.height - 0.5;
    });

    // Animate
    let animationFrameId;

    const clock = new THREE.Clock();
    let previousTime = 0;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      // animate camera
      // update the camera pos based on the scrollY
      camera.position.y = -(scrollY / sizes.height) * objectsDistance;

      const parallaxX = cursor.x * 0.5; // lower amplitude by multiplying by 0.5
      const parallaxY = -cursor.y * 0.5;

      // instead of applying the parallax on the camera, apply it on the cameraGroup
      // this works becuase the camera is moving inside the Group.

      // this adds a smooth transition to the cameraGroup position (EASING)
      cameraGroup.position.x +=
        (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
      cameraGroup.position.y +=
        (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

      // Animate meshes
      for (const mesh of sectionMeshes) {
        mesh.rotation.x += 0.1 * deltaTime;
        mesh.rotation.y += 0.12 * deltaTime;
      }

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
      sectionMeshes.forEach((mesh) => mesh.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div className='bg-[#1e1a20]'>
      <canvas
        ref={canvasRef}
        className='fixed top-0 left-0 w-full h-full outline-none'
      />
      <section className='section'>
        <h1>My Portfolio</h1>
      </section>
      <section className='section'>
        <h2>My projects</h2>
      </section>
      <section className='section'>
        <h2>Contact me</h2>
      </section>
    </div>
  );
}
