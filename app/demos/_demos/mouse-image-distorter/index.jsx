"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import GUI from "lil-gui";
import localFont from "next/font/local";

const myFont = localFont({
  src: "/FreightText-Medium.otf",
  display: "swap",
});

console.log(myFont.className);

const projects = [
  { name: "Fragments", image: "/demos/image.avif" },
  { name: "Surface Tension", image: "/demos/14.avif" },
  { name: "Parallel Lines", image: "/demos/22.avif" },
  { name: "Deep Current", image: "/demos/11.avif" },
  { name: "Open Field", image: "/demos/12.avif" },
];

export default function MouseImageDistorter() {
  const canvasRef = useRef(null);
  const texturesRef = useRef(new Map());
  const planeMaterialRef = useRef(null);
  const planeRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene
    const scene = new THREE.Scene();

    /* Textures */
    // Image textures
    const textureLoader = new THREE.TextureLoader();

    // Load all project textures
    const textures = new Map();
    projects.forEach((project) => {
      const texture = textureLoader.load(project.image);
      textures.set(project.image, texture);
    });

    // Store textures in ref for access outside useEffect
    texturesRef.current = textures;

    // Start with first project's texture
    const planeTexture = textures.get(projects[0].image);

    // // Debug UI
    // const gui = new GUI({
    //   width: 250,
    //   title: "Debug UI",
    // });

    // // Position the GUI
    // gui.domElement.style.position = "fixed";
    // gui.domElement.style.top = "65vh";
    // gui.domElement.style.right = "15px";

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /* Materials */
    const planeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: planeTexture },
        uMovementDirection: { value: new THREE.Vector2(0, 0) },
        uDistortionStrength: { value: 0.1 },
      },
      vertexShader,
      fragmentShader,
    });

    // Store material in ref for access outside useEffect
    planeMaterialRef.current = planeMaterial;

    const planeGeometry = new THREE.PlaneGeometry(2, 2.5, 64, 64);
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, 0, 0);
    plane.scale.x = 2 / 3;
    plane.scale.y = 2 / 3;
    scene.add(plane);

    // Store plane in ref for access outside useEffect
    planeRef.current = plane;

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
    controls.enableZoom = false; // Disable zooming
    controls.enableRotate = false; // Disable rotating
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: false,
      antialias: true,
    });

    renderer.setClearColor(0xffffff); // Set background to white
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
    const targetPosition = {
      x: 0,
      y: 0,
    };
    const previousPlanePosition = {
      x: 0,
      y: 0,
    };
    const handleMouseMove = (event) => {
      cursor.x = (event.clientX / sizes.width) * 2 - 1;
      cursor.y = -(event.clientY / sizes.height) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animate
    let animationFrameId;

    const clock = new THREE.Clock();
    let previousTime = 0;

    // Lerp function for smooth easing
    const lerp = (start, end, factor) => {
      return start + (end - start) * factor;
    };

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - previousTime;
      previousTime = elapsedTime;

      // Update shader time for wave animation (multiply by 1.5 to make animation quicker)
      planeMaterial.uniforms.uTime.value = elapsedTime * 2;

      // Convert cursor position to world coordinates
      // Calculate the distance from camera to the plane's z position
      const distance = Math.abs(camera.position.z - plane.position.z);
      const fov = camera.fov * (Math.PI / 180);
      const height = 2 * Math.tan(fov / 2) * distance;
      const width = height * camera.aspect;

      // Convert normalized cursor coordinates to world space
      const worldX = (cursor.x * width) / 2;
      const worldY = (cursor.y * height) / 2;

      // Update target position
      targetPosition.x = worldX;
      targetPosition.y = worldY;

      // Smoothly interpolate plane position towards target (0.1 = smooth, lower = smoother but slower)
      const easeFactor = 0.08;
      plane.position.x = lerp(
        plane.position.x,
        targetPosition.x,
        easeFactor
      );
      plane.position.y = lerp(
        plane.position.y,
        targetPosition.y,
        easeFactor
      );

      // Calculate movement direction (velocity)
      const movementX = plane.position.x - previousPlanePosition.x;
      const movementY = plane.position.y - previousPlanePosition.y;

      // Normalize movement direction and apply damping for smooth transitions
      const movementMagnitude = Math.sqrt(
        movementX * movementX + movementY * movementY
      );
      const normalizedX =
        movementMagnitude > 0.001 ? movementX / movementMagnitude : 0;
      const normalizedY =
        movementMagnitude > 0.001 ? movementY / movementMagnitude : 0;

      // Smooth the movement direction
      const directionEase = 0.2;
      const currentDir =
        planeMaterial.uniforms.uMovementDirection.value;
      currentDir.x = lerp(currentDir.x, normalizedX, directionEase);
      currentDir.y = lerp(currentDir.y, normalizedY, directionEase);

      // Calculate amplitude based on movement speed
      // Map movement speed to amplitude (0 to maxAmplitude)
      // Adjust the multiplier to control sensitivity
      const maxAmplitude = 0.1;
      const speedMultiplier = 6.0; // Adjust this to control how speed maps to amplitude
      const targetAmplitude = Math.min(
        movementMagnitude * speedMultiplier,
        maxAmplitude
      );

      // Smoothly interpolate amplitude changes
      const amplitudeEase = 0.15;
      const currentAmplitude =
        planeMaterial.uniforms.uDistortionStrength.value;
      planeMaterial.uniforms.uDistortionStrength.value = lerp(
        currentAmplitude,
        targetAmplitude,
        amplitudeEase
      );

      // Update previous position
      previousPlanePosition.x = plane.position.x;
      previousPlanePosition.y = plane.position.y;

      // Render
      renderer.render(scene, camera);

      animationFrameId = window.requestAnimationFrame(tick);
    };

    // call tick again on the next frame
    tick();

    // Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  const [activeProject, setActiveProject] = useState(projects[0]);

  // Update texture when activeProject changes
  useEffect(() => {
    if (planeMaterialRef.current && texturesRef.current) {
      const texture = texturesRef.current.get(activeProject.image);
      if (texture) {
        planeMaterialRef.current.uniforms.uTexture.value = texture;
      }
    }
  }, [activeProject]);

  // Hide/show plane based on hover state
  useEffect(() => {
    if (planeRef.current) {
      if (isHovered) {
        planeRef.current.visible = true;
      } else {
        planeRef.current.visible = false;
      }
    }
  }, [isHovered]);

  return (
    <div className={``}>
      <canvas
        ref={canvasRef}
        className='fixed top-0 left-0 w-full h-full outline-none'
      />
      <div
        className='absolute top-0 left-0 w-full min-h-screen'
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        {projects.map((project, index) => (
          <div
            key={index}
            className={`p-4 w-full flex items-center text-white transition-colors duration-300 cursor-pointer ${index !== projects.length - 1 ? "border-b" : ""}`} style={{
              fontSize: "5vh",
              letterSpacing: "-0.0em",
              cursor: "pointer",
              height: "20vh",
              mixBlendMode: "difference",
              ...(index !== projects.length - 1 && {
                borderColor: "#fff",
              }),
            }}
            onMouseEnter={() => {
              setActiveProject(project);
              setIsHovered(true);
              console.log(index);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
            }}
          >
            {project.name}
          </div>
        ))}
      </div>
    </div>
  );
}
