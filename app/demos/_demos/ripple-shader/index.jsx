"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import ripple from "./ripple.png";
import image from "./image.png";

export default function RippleShader() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Scene setup
    const scene = new THREE.Scene();
    const scene1 = new THREE.Scene();

    // texture to render things on
    let baseTexture = new THREE.WebGLRenderTarget(
      sizes.width,
      sizes.height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      }
    );

    // Orthographic camera
    const frustumSize = sizes.height;
    const aspect = sizes.width / sizes.height;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      -1000,
      1000
    );
    camera.position.set(0, 0, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.appendChild(renderer.domElement);

    let mouse = new THREE.Vector2(0, 0);
    let prevMouse = new THREE.Vector2(0, 0);
    let currentWave = 0;

    const moveMouse = (event) => {
      mouse.x = event.clientX - sizes.width / 2;
      mouse.y = sizes.height / 2 - event.clientY;
    };

    window.addEventListener("mousemove", moveMouse);

    // Create plane geometry (1x1 base, scaled via mesh.scale)
    const geometry = new THREE.PlaneGeometry(40, 40, 1, 1);

    // Create shader material
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: new THREE.TextureLoader().load(image.src) },
        uDisplacement: { value: null },
        resolution: { value: new THREE.Vector4() },
      },
    });

    const maxWaves = 50;
    const meshes = [];

    // create 50 randomly rotated brushes on the screen
    for (let i = 0; i < maxWaves; i++) {
      let m = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(ripple.src),
        transparent: true,
        blending: THREE.AdditiveBlending, // we dont want to take of z-index and how they overlap
        depthTest: false, // we dont want to take of z-index and how they overlap
        depthWrite: false, // we dont want to take of z-index and how they overlap
      });

      let mesh = new THREE.Mesh(geometry, m);

      mesh.visible = false;
      mesh.rotation.z = Math.random() * 2 * Math.PI;
      scene.add(mesh);
      meshes.push(mesh);
    }

    // const mesh = new THREE.Mesh(geometry, material1);
    // scene.add(mesh);

    const setNewWave = (x, y, index) => {
      let mesh = meshes[index]; // mesh we want to be currently animated
      mesh.visible = true;
      mesh.position.x = x;
      mesh.position.y = y;
      mesh.material.opacity = 1; // reset opacity
      mesh.scale.x = mesh.scale.y = 1;
    };

    const trackMousePos = () => {
      if (
        Math.abs(mouse.x - prevMouse.x) < 4 &&
        Math.abs(mouse.y - prevMouse.y) < 4
      ) {
        // this means mouse is in the 4px manhattan distance from the previous mouse position
        // so we don't need to create a new wave
      } else {
        setNewWave(mouse.x, mouse.y, currentWave);
        currentWave = (currentWave + 1) % maxWaves;
        console.log(currentWave);
      }

      // Update prevMouse to current position for next frame comparison
      prevMouse.x = mouse.x;
      prevMouse.y = mouse.y;
    };

    // Debug UI
    // Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
      trackMousePos();
      const elapsedTime = clock.getElapsedTime();
      material.uniforms.uTime.value =
        elapsedTime;

      meshes.forEach((mesh) => {
        if (mesh.visible) {
          // Mouse coordinates are already in world space (pixels centered at 0,0)
          // mesh.position.x = mouse.x;
          // mesh.position.y = mouse.y;

          mesh.rotation.z += 0.01;
          mesh.material.opacity *= 0.96;

          // this simulates one of the easing curves
          // suimulates really slow exponential growth, but not linear
          mesh.scale.x = 0.98 * mesh.scale.x + 0.1;
          mesh.scale.y = 0.98 * mesh.scale.y + 0.1;

          if (mesh.material.opacity < 0.02) {
            mesh.visible = false;
          }
        }
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // Update camera frustum
      const newFrustumSize = sizes.height;
      const aspect = sizes.width / sizes.height;
      camera.left = (newFrustumSize * aspect) / -2;
      camera.right = (newFrustumSize * aspect) / 2;
      camera.top = newFrustumSize / 2;
      camera.bottom = newFrustumSize / -2;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className='w-full fixed top-0 left-0' />
  );
}
