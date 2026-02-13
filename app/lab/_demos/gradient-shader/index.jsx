"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import GUI from "lil-gui";

// Import shaders as raw strings
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

export default function GradientShader() {
  const containerRef = useRef();
  const guiRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 1;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Shader material uniforms
    const uniforms = {
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_mouse: { value: new THREE.Vector2(0.0, 0.0) },
      u_time: { value: 0.0 },
      u_noiseScale: { value: 4.2 },
      u_timeScale: { value: 0.15 },
      u_smoothMin: { value: 0.47 },
      u_smoothMax: { value: 0.47 },
      u_color1: { value: new THREE.Color("#DBCCC5") }, // Base - Light beige
      u_color2: { value: new THREE.Color("#B391FF") }, // Purple
      u_color3: { value: new THREE.Color("#FF4E33") }, // Red-orange
      u_color4: { value: new THREE.Color("#FF8CCA") }, // Pink
      u_mouseRadius: { value: 0.25 },
      u_mouseStrength: { value: 0.08 }
    };

    // Calculate plane size to fill screen
    const distance = camera.position.z;
    const vFov = (camera.fov * Math.PI) / 180;
    const planeHeight = 2 * Math.tan(vFov / 2) * distance;
    const planeWidth = planeHeight * camera.aspect;

    // Create plane geometry that fills the screen
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 32, 32);

    // Create shader material
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      side: THREE.DoubleSide,
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Setup lil-gui
    const gui = new GUI();
    gui.domElement.style.position = "fixed";
    gui.domElement.style.bottom = "10px";
    gui.domElement.style.left = "10px";
    gui.domElement.style.top = "auto";
    guiRef.current = gui;

    // Mouse smoothness variable
    let mouseSmoothness = 0.05;

    // GUI controls object
    const guiControls = {
      noiseScale: uniforms.u_noiseScale.value,
      timeScale: uniforms.u_timeScale.value,
      smoothMin: uniforms.u_smoothMin.value,
      smoothMax: uniforms.u_smoothMax.value,
      color1: "#DBCCC5",
      color2: "#B391FF",
      color3: "#FF4E33",
      color4: "#FF8CCA",
      mouseRadius: uniforms.u_mouseRadius.value,
      mouseStrength: uniforms.u_mouseStrength.value,
      mouseSmoothness: mouseSmoothness
    };

    // Noise Controls
    const noiseFolder = gui.addFolder("Noise");
    noiseFolder.add(guiControls, "noiseScale", 0.5, 10, 0.1).name("Scale").onChange((value) => {
      uniforms.u_noiseScale.value = value;
    });

    noiseFolder.add(guiControls, "timeScale", 0, 1, 0.01).name("Time Scale").onChange((value) => {
      uniforms.u_timeScale.value = value;
    });

    noiseFolder.add(guiControls, "smoothMin", 0, 1, 0.01).name("Smooth Min").onChange((value) => {
      uniforms.u_smoothMin.value = value;
    });

    noiseFolder.add(guiControls, "smoothMax", 0, 1, 0.01).name("Smooth Max").onChange((value) => {
      uniforms.u_smoothMax.value = value;
    });

    // Color Controls
    const colorFolder = gui.addFolder("Colors");
    colorFolder.addColor(guiControls, "color1").name("Base Color").onChange((value) => {
      uniforms.u_color1.value.set(value);
    });

    colorFolder.addColor(guiControls, "color2").name("Gradient 1").onChange((value) => {
      uniforms.u_color2.value.set(value);
    });

    colorFolder.addColor(guiControls, "color3").name("Gradient 2").onChange((value) => {
      uniforms.u_color3.value.set(value);
    });

    colorFolder.addColor(guiControls, "color4").name("Gradient 3").onChange((value) => {
      uniforms.u_color4.value.set(value);
    });

    // Mouse Interaction Controls
    const mouseFolder = gui.addFolder("Mouse Interaction");
    mouseFolder.add(guiControls, "mouseRadius", 0, 0.8, 0.01).name("Radius").onChange((value) => {
      uniforms.u_mouseRadius.value = value;
    });

    mouseFolder.add(guiControls, "mouseStrength", 0, 0.3, 0.01).name("Strength").onChange((value) => {
      uniforms.u_mouseStrength.value = value;
    });

    mouseFolder.add(guiControls, "mouseSmoothness", 0.01, 0.3, 0.01).name("Smoothness").onChange((value) => {
      mouseSmoothness = value;
    });

    // Open folders by default
    noiseFolder.open();
    colorFolder.open();
    mouseFolder.open();

    // Clock for animation
    const clock = new THREE.Clock();

    // Smooth mouse tracking
    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };

    const handleMouseMove = (event) => {
      targetMouse.x = event.clientX;
      targetMouse.y = window.innerHeight - event.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      // Update time uniform
      uniforms.u_time.value = clock.getElapsedTime();

      // Smooth mouse interpolation (lerp)
      currentMouse.x += (targetMouse.x - currentMouse.x) * mouseSmoothness;
      currentMouse.y += (targetMouse.y - currentMouse.y) * mouseSmoothness;

      // Update mouse uniform with smoothed values
      uniforms.u_mouse.value.x = currentMouse.x;
      uniforms.u_mouse.value.y = currentMouse.y;

      // Render
      renderer.render(scene, camera);

      requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      // Update resolution uniform
      uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);

      // Recalculate plane size
      const distance = camera.position.z;
      const vFov = (camera.fov * Math.PI) / 180;
      const planeHeight = 2 * Math.tan(vFov / 2) * distance;
      const planeWidth = planeHeight * camera.aspect;

      geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 32, 32);

      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (guiRef.current) {
        guiRef.current.destroy();
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="fixed top-0 left-0 w-full h-full" />;
}
