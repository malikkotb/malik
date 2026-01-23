"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import GUI from "lil-gui";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

export default function TileHoverDistortion() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#ffffff");

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Camera
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    camera.position.z = 3;
    scene.add(camera);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Settings
    const settings = {
      grid: 35,
      mouse: 0.1,
      strength: 0.45,
      relaxation: 0.95,
    };

    // Create DataTexture (using RGBA for modern Three.js)
    const createDataTexture = (size) => {
      const data = new Float32Array(4 * size * size);
      for (let i = 0; i < size * size; i++) {
        data[i * 4] = 0;      // R - X displacement
        data[i * 4 + 1] = 0;  // G - Y displacement
        data[i * 4 + 2] = 0;  // B - unused
        data[i * 4 + 3] = 1;  // A - alpha
      }
      // Use RGBAFormat (modern API) instead of deprecated RGBFormat
      const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.needsUpdate = true;
      return texture;
    };

    // Geometry
    const planeWidth = 1.75;
    const planeHeight = planeWidth * (5 / 4);
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 1, 1);

    // Create DataTextures for 3 planes
    let dataTexture1 = createDataTexture(settings.grid);
    let dataTexture2 = createDataTexture(settings.grid);
    let dataTexture3 = createDataTexture(settings.grid);

    // Create materials for each plane
    const material1 = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        uTexture: { value: new THREE.Texture() },
        uDataTexture: { value: dataTexture1 },
        uResolution: { value: new THREE.Vector4(sizes.width, sizes.height, 1, 1) },
      },
    });

    const material2 = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        uTexture: { value: new THREE.Texture() },
        uDataTexture: { value: dataTexture2 },
        uResolution: { value: new THREE.Vector4(sizes.width, sizes.height, 1, 1) },
      },
    });

    const material3 = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        uTexture: { value: new THREE.Texture() },
        uDataTexture: { value: dataTexture3 },
        uResolution: { value: new THREE.Vector4(sizes.width, sizes.height, 1, 1) },
      },
    });

    // Create 3 planes positioned horizontally
    const spacing = 2.2;
    const plane1 = new THREE.Mesh(geometry, material1);
    plane1.position.x = -spacing;
    plane1.visible = false; // Hide until texture loads

    const plane2 = new THREE.Mesh(geometry, material2);
    plane2.position.x = 0;
    plane2.visible = false; // Hide until texture loads

    const plane3 = new THREE.Mesh(geometry, material3);
    plane3.position.x = spacing;
    plane3.visible = false; // Hide until texture loads

    // Add planes to scene
    scene.add(plane1);
    scene.add(plane2);
    scene.add(plane3);

    // Helper function to load texture and set aspect ratio
    const textureLoader = new THREE.TextureLoader();
    const loadTexture = (imagePath, material, plane) => {
      textureLoader.load(imagePath, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        material.uniforms.uTexture.value = texture;
        material.uniformsNeedUpdate = true;

        // Calculate aspect ratio for object-fit: cover
        if (texture.image) {
          const imageAspect = texture.image.width / texture.image.height;
          const planeAspect = planeWidth / planeHeight;
          let a1, a2;
          if (planeAspect > imageAspect) {
            a1 = 1;
            a2 = imageAspect / planeAspect;
          } else {
            a1 = planeAspect / imageAspect;
            a2 = 1;
          }
          material.uniforms.uResolution.value.z = a1;
          material.uniforms.uResolution.value.w = a2;
        }

        // Make plane visible once texture is loaded
        plane.visible = true;
      });
    };

    // Load textures for each plane
    loadTexture("/demos/img1.png", material1, plane1);
    loadTexture("/demos/img4.png", material2, plane2);
    loadTexture("/demos/img3.png", material3, plane3);

    // Store planes in array for easier management
    const planes = [plane1, plane2, plane3];
    const dataTextures = [dataTexture1, dataTexture2, dataTexture3];

    // Mouse state for each plane
    const mouseStates = [
      { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, vX: 0, vY: 0, isHovering: false },
      { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, vX: 0, vY: 0, isHovering: false },
      { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, vX: 0, vY: 0, isHovering: false },
    ];

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const updateInteraction = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planes);

      // Reset all hovering states
      mouseStates.forEach(state => state.isHovering = false);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const planeIndex = planes.indexOf(intersectedObject);

        if (planeIndex !== -1) {
          const mouseState = mouseStates[planeIndex];
          mouseState.isHovering = true;
          const uv = intersects[0].uv;

          mouseState.vX = uv.x - mouseState.prevX;
          mouseState.vY = uv.y - mouseState.prevY;
          mouseState.prevX = mouseState.x;
          mouseState.prevY = mouseState.y;
          mouseState.x = uv.x;
          mouseState.y = uv.y;
        }
      }
    };

    const handleMouseMove = (e) => {
      updateInteraction(e.clientX, e.clientY);
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        const touch = e.touches[0];
        updateInteraction(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = () => {
      // Reset all hovering states when touch ends
      mouseStates.forEach(state => state.isHovering = false);
    };

    canvasRef.current.addEventListener("mousemove", handleMouseMove);
    canvasRef.current.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvasRef.current.addEventListener("touchend", handleTouchEnd);

    // Update DataTexture function for all planes (RGBA version)
    const updateDataTexture = () => {
      const size = settings.grid;
      const aspect = planeHeight / planeWidth;

      // Update each plane's DataTexture
      dataTextures.forEach((dataTexture, planeIndex) => {
        const data = dataTexture.image.data;
        const mouseState = mouseStates[planeIndex];

        // Apply relaxation to all values (stride of 4 for RGBA)
        for (let i = 0; i < data.length; i += 4) {
          data[i] *= settings.relaxation;     // R
          data[i + 1] *= settings.relaxation; // G
        }

        // Only update if this plane is hovered
        if (mouseState.isHovering) {
          const gridMouseX = size * mouseState.x;
          const gridMouseY = size * mouseState.y;
          const maxDist = size * settings.mouse;
          const maxDistSq = maxDist ** 2;

          for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
              const distance = ((gridMouseX - i) ** 2) / aspect + (gridMouseY - j) ** 2;

              if (distance < maxDistSq) {
                const index = 4 * (i + size * j); // Stride of 4 for RGBA
                let power = maxDist / Math.sqrt(distance);
                power = clamp(power, 0, 10);

                data[index] += settings.strength * 100 * mouseState.vX * power;
                data[index + 1] -= settings.strength * 100 * mouseState.vY * power;
              }
            }
          }
        }

        // Decay velocity
        mouseState.vX *= 0.9;
        mouseState.vY *= 0.9;
        dataTexture.needsUpdate = true;
      });
    };

    // GUI
    const gui = new GUI({ width: 340, title: "Pixel Distortion Controls" });
    gui.domElement.style.position = "absolute";
    gui.domElement.style.bottom = "0";
    gui.domElement.style.left = "0";
    gui.domElement.style.top = "auto";
    gui.domElement.style.right = "auto";

    gui.add(settings, "grid", 10, 100, 1).name("Grid Resolution").onFinishChange(() => {
      // Regenerate all DataTextures
      dataTextures.forEach((dataTexture, index) => {
        dataTexture.dispose();
        dataTextures[index] = createDataTexture(settings.grid);
      });
      dataTexture1 = dataTextures[0];
      dataTexture2 = dataTextures[1];
      dataTexture3 = dataTextures[2];
      material1.uniforms.uDataTexture.value = dataTexture1;
      material2.uniforms.uDataTexture.value = dataTexture2;
      material3.uniforms.uDataTexture.value = dataTexture3;
    });
    gui.add(settings, "mouse", 0.1, 1, 0.01).name("Mouse Radius");
    gui.add(settings, "strength", 0.1, 2, 0.01).name("Strength");
    gui.add(settings, "relaxation", 0.8, 0.99, 0.01).name("Relaxation");

    // Animation loop
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update all materials' time uniforms
      material1.uniforms.time.value = elapsedTime;
      material2.uniforms.time.value = elapsedTime;
      material3.uniforms.time.value = elapsedTime;

      // Update all DataTextures
      updateDataTexture();

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };

    tick();

    // Resize handler
    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      canvasRef.current?.removeEventListener("mousemove", handleMouseMove);
      canvasRef.current?.removeEventListener("touchmove", handleTouchMove);
      canvasRef.current?.removeEventListener("touchend", handleTouchEnd);
      gui.destroy();
      geometry.dispose();
      material1.dispose();
      material2.dispose();
      material3.dispose();
      dataTextures.forEach(dataTexture => dataTexture.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div className='fixed top-0 left-0 w-full h-full'>
      <canvas ref={canvasRef} />
    </div>
  );
}
