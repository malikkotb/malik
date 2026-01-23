"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import { useScroll, useMotionValueEvent } from "motion/react"

export default function CubeInteraction() {
  const canvasRef = useRef(null);
  const meshRef = useRef(null);
  const debugObject = {};
  const { scrollYProgress } = useScroll();

  // Handle scroll-based rotation
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (meshRef.current && debugObject) {
      const rotationAmount = latest * Math.PI * debugObject.rotationSpeed;
      if (debugObject.enableXRotation) meshRef.current.rotation.x = rotationAmount;
      if (debugObject.enableYRotation) meshRef.current.rotation.y = rotationAmount;
      if (debugObject.enableZRotation) meshRef.current.rotation.z = rotationAmount;
    }
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    // Debug UI
    const gui = new GUI({ width: 300, title: "Debug UI" });

    // Scene
    const scene = new THREE.Scene();

    // Textures
    const loadingManager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(loadingManager);

    // Load different textures for each face
    const textures = [
      textureLoader.load("/demos/textures/image1.png"),
      textureLoader.load("/demos/textures/image2.png"),
      textureLoader.load("/demos/textures/image3.png"),
      textureLoader.load("/demos/textures/image4.png"),
      textureLoader.load("/demos/textures/image5.png"),
      textureLoader.load("/demos/textures/image6.png"),
    ];

    // Set colorSpace for all textures
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
    });

    // Object
    debugObject.color = "#35b673";
    debugObject.rotationSpeed = 2; // Default rotation multiplier
    debugObject.enableXRotation = false;
    debugObject.enableYRotation = true;
    debugObject.enableZRotation = true;
    debugObject.scale = 1.5;

    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5, 2, 2, 2);

    // Create materials array for each face
    const materials = textures.map(
      (texture) => new THREE.MeshBasicMaterial({ map: texture })
    );

    // Create mesh with multiple materials
    const mesh = new THREE.Mesh(geometry, materials);
    meshRef.current = mesh;
    scene.add(mesh);

    // Debug UI folders
    const positionFolder = gui.addFolder('Position');
    const rotationFolder = gui.addFolder('Rotation');
    const materialFolder = gui.addFolder('Material');
    const scaleFolder = gui.addFolder('Scale');

    // Position controls
    positionFolder
      .add(mesh.position, "x")
      .min(-3)
      .max(3)
      .step(0.01)
      .name("X Position");

    positionFolder
      .add(mesh.position, "y")
      .min(-3)
      .max(3)
      .step(0.01)
      .name("Y Position");

    positionFolder
      .add(mesh.position, "z")
      .min(-3)
      .max(3)
      .step(0.01)
      .name("Z Position");

    // Rotation controls
    rotationFolder
      .add(debugObject, "rotationSpeed")
      .min(0)
      .max(5)
      .step(0.1)
      .name("Rotation Speed");

    rotationFolder
      .add(debugObject, "enableXRotation")
      .name("Enable X Rotation");

    rotationFolder
      .add(debugObject, "enableYRotation")
      .name("Enable Y Rotation");

    rotationFolder
      .add(debugObject, "enableZRotation")
      .name("Enable Z Rotation");

    // Material controls
    materials.forEach((material, index) => {
      materialFolder
        .add(material, "transparent")
        .name(`Face ${index + 1} Transparent`);
      
      materialFolder
        .add(material, "opacity")
        .min(0)
        .max(1)
        .step(0.01)
        .name(`Face ${index + 1} Opacity`);
    });

    // Scale controls
    const updateScale = () => {
      mesh.scale.set(debugObject.scale, debugObject.scale, debugObject.scale);
    };

    scaleFolder
      .add(debugObject, "scale")
      .min(0.5)
      .max(3)
      .step(0.1)
      .name("Uniform Scale")
      .onChange(updateScale);

    // Open position folder by default
    positionFolder.open();
      

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.z = 3;
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;
    controls.enableZoom = false; // Disable zooming

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor("#f0f0f0", 1); // Set white background

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

    const tick = () => {
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
      geometry.dispose();
      materials.forEach((material) => material.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ height: '350vh', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        className='webgl'
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh'
        }}
      />
    </div>
  );
}
