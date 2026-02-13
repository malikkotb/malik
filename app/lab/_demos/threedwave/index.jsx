"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import GUI from "lil-gui";

export default function ThreeDWaveScroll() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene
    const scene = new THREE.Scene();

    /* Textures */
    // Image textures
    const textureLoader = new THREE.TextureLoader();

    // Load texture for the plane
    const planeTexture = textureLoader.load("/demos/image.avif");

    // // Debug UI
    // const gui = new GUI({
    //   width: 250,
    //   title: "Debug UI",
    // });

    // // Position the GUI
    // gui.domElement.style.position = "fixed";
    // gui.domElement.style.top = "65vh";
    // gui.domElement.style.right = "15px";

    const parameters = {
      amplitude: 0.35,
      wavelength: 4.0,
    };

    // gui.add(parameters, "amplitude", 0, 1).onChange(() => {
    //   planeMaterial.uniforms.uAmplitude.value = parameters.amplitude;
    // });

    // gui.add(parameters, "wavelength", 0, 10).onChange(() => {
    //   planeMaterial.uniforms.uWavelength.value =
    //     parameters.wavelength;
    // });

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /* Objects */

    /* Materials */
    const material = new THREE.MeshToonMaterial({
      color: parameters.materialColor,
    });

    /* Meshes */

    // Custom shader material for wave effect
    const vertexShader = `
      uniform float uTime;
      uniform float uAmplitude;
      uniform float uWavelength;
      varying vec2 vUv;
      
      void main() {
        vec3 pos = position;
        
        // Create wave effect
        pos.z += sin(pos.x * uWavelength + uTime) * uAmplitude;
        
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture;
      
      varying vec2 vUv;
      
      void main() {
        vec4 textureColor = texture2D(uTexture, vUv);
        gl_FragColor = textureColor;
      }
    `;

    const planeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: planeTexture },
        uAmplitude: { value: parameters.amplitude },
        uWavelength: { value: parameters.wavelength },
      },
      vertexShader,
      fragmentShader,
    });

    const planeGeometry = new THREE.PlaneGeometry(2, 2.5, 64, 64);
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, 0, 0);
    scene.add(plane);

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

    // Orbit Controls
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;
    controls.enablePan = false; // Disable moving around
    // controls.enableZoom = false; // Disable zooming
    controls.enableRotate = false; // Disable rotating
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;

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

    /* Cursor */
    const cursor = {
      x: 0,
      y: 0,
    };
    const handleMouseMove = (event) => {
      cursor.x = event.clientX / sizes.width - 0.5;
      cursor.y = event.clientY / sizes.height - 0.5;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animate
    let animationFrameId;

    const clock = new THREE.Clock();
    let previousTime = 0;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      // Update shader time for wave animation (multiply by 1.5 to make animation quicker)
      planeMaterial.uniforms.uTime.value = elapsedTime * 2;

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
    <div className='bg-[#1e1a20]'>
      <canvas
        ref={canvasRef}
        className='fixed top-0 left-0 w-full h-full outline-none'
      />
    </div>
  );
}
