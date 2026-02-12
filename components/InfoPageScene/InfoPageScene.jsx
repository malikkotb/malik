"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

export default function InfoPageScene() {
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !isReady) return;

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Scene for ripple brushes (rendered to texture)
    const brushScene = new THREE.Scene();

    // Scene for the image quad
    const contentScene = new THREE.Scene();

    // Render target for displacement map
    let displacementTarget = new THREE.WebGLRenderTarget(
      sizes.width,
      sizes.height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      }
    );

    // Orthographic camera (pixel coordinates)
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

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0);

    containerRef.current.appendChild(renderer.domElement);

    // Mouse tracking
    let mouse = new THREE.Vector2(0, 0);
    let prevMouse = new THREE.Vector2(0, 0);
    let currentWave = 0;

    const moveMouse = (event) => {
      mouse.x = event.clientX - sizes.width / 2;
      mouse.y = sizes.height / 2 - event.clientY;
    };

    window.addEventListener("mousemove", moveMouse);

    // Touch support
    const moveTouch = (event) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouse.x = touch.clientX - sizes.width / 2;
        mouse.y = sizes.height / 2 - touch.clientY;
      }
    };

    window.addEventListener("touchmove", moveTouch, { passive: true });

    // Create brush geometry and meshes
    const brushGeometry = new THREE.PlaneGeometry(64, 64, 1, 1);
    const maxWaves = 100;
    const brushMeshes = [];

    // Load ripple texture
    const textureLoader = new THREE.TextureLoader();
    const rippleTexture = textureLoader.load("/ripple.png");

    // Create brush meshes
    for (let i = 0; i < maxWaves; i++) {
      let material = new THREE.MeshBasicMaterial({
        map: rippleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      });

      let mesh = new THREE.Mesh(brushGeometry, material);
      mesh.visible = false;
      mesh.rotation.z = Math.random() * 2 * Math.PI;
      brushScene.add(mesh);
      brushMeshes.push(mesh);
    }

    // Calculate grid column positions (12-column grid with padding)
    const gridPadding = 14;
    const gridGap = 20;
    const contentWidth = sizes.width - gridPadding * 2;
    const colWidth = (contentWidth - gridGap * 11) / 12;

    const getColX = (colStart, colSpan) => {
      const startX = -sizes.width / 2 + gridPadding + (colStart - 1) * (colWidth + gridGap);
      const width = colSpan * colWidth + (colSpan - 1) * gridGap;
      return { x: startX + width / 2, width };
    };

    // --- HERO IMAGE (col 7-11, aspect 4:3) ---
    const heroImageCol = getColX(7, 5);
    const heroImageWidth = heroImageCol.width;
    const heroImageHeight = heroImageWidth * (3 / 4); // 4:3 aspect ratio (1024x768)

    const heroImageTexture = textureLoader.load("/about.jpeg");

    const imageGeometry = new THREE.PlaneGeometry(heroImageWidth, heroImageHeight, 1, 1);
    const imageMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: heroImageTexture },
        uDisplacement: { value: null },
        resolution: { value: new THREE.Vector4(heroImageWidth, heroImageHeight, 1, 1) },
        uQuadOffset: { value: new THREE.Vector2() },
        uQuadSize: { value: new THREE.Vector2() },
      },
    });

    const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
    imageMesh.position.x = heroImageCol.x;
    imageMesh.position.y = 0;
    imageMesh.userData.initialY = 0;
    imageMesh.userData.width = heroImageWidth;
    imageMesh.userData.height = heroImageHeight;

    // Calculate normalized screen position for displacement
    const normalizedX = (heroImageCol.x + sizes.width / 2 - heroImageWidth / 2) / sizes.width;
    const normalizedY = (0 + sizes.height / 2 - heroImageHeight / 2) / sizes.height;
    imageMaterial.uniforms.uQuadOffset.value.set(normalizedX, normalizedY);
    imageMaterial.uniforms.uQuadSize.value.set(heroImageWidth / sizes.width, heroImageHeight / sizes.height);

    contentScene.add(imageMesh);

    // Wave creation
    const setNewWave = (x, y, index) => {
      let mesh = brushMeshes[index];
      mesh.visible = true;
      mesh.position.x = x;
      mesh.position.y = y;
      mesh.material.opacity = 1;
      mesh.scale.x = mesh.scale.y = 1;
    };

    const trackMousePos = () => {
      if (
        Math.abs(mouse.x - prevMouse.x) < 4 &&
        Math.abs(mouse.y - prevMouse.y) < 4
      ) {
        // Mouse hasn't moved enough
      } else {
        setNewWave(mouse.x, mouse.y, currentWave);
        currentWave = (currentWave + 1) % maxWaves;
      }

      prevMouse.x = mouse.x;
      prevMouse.y = mouse.y;
    };

    // Update image position based on scroll
    const updateScrollPosition = () => {
      const scrollY = window.lenis?.scroll || window.scrollY || 0;
      imageMesh.position.y = imageMesh.userData.initialY + scrollY;

      // Update shader uniforms for displacement mapping
      const newNormalizedY = (imageMesh.position.y + sizes.height / 2 - heroImageHeight / 2) / sizes.height;
      imageMaterial.uniforms.uQuadOffset.value.set(normalizedX, newNormalizedY);
    };

    // Animation loop
    const clock = new THREE.Clock();
    let animationId;

    const animate = () => {
      trackMousePos();
      updateScrollPosition();
      const elapsedTime = clock.getElapsedTime();

      imageMaterial.uniforms.uTime.value = elapsedTime;

      // Step 1: Render brush scene to displacement texture (black background)
      renderer.setClearColor(0x000000, 1);
      renderer.setRenderTarget(displacementTarget);
      renderer.clear();
      renderer.render(brushScene, camera);

      // Step 2: Pass displacement texture to image material
      imageMaterial.uniforms.uDisplacement.value = displacementTarget.texture;

      // Step 3: Render content scene to screen (transparent background)
      renderer.setClearColor(0xffffff, 0);
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(contentScene, camera);

      // Update brush meshes (fade out and grow)
      brushMeshes.forEach((mesh) => {
        if (mesh.visible) {
          mesh.rotation.z += 0.01;
          mesh.material.opacity *= 0.96;
          mesh.scale.x = 0.982 * mesh.scale.x + 0.108;
          mesh.scale.y = mesh.scale.x;

          if (mesh.material.opacity < 0.002) {
            mesh.visible = false;
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // Update camera
      const newFrustumSize = sizes.height;
      const newAspect = sizes.width / sizes.height;
      camera.left = (newFrustumSize * newAspect) / -2;
      camera.right = (newFrustumSize * newAspect) / 2;
      camera.top = newFrustumSize / 2;
      camera.bottom = newFrustumSize / -2;
      camera.updateProjectionMatrix();

      // Update renderer and render target
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      displacementTarget.setSize(sizes.width, sizes.height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", moveMouse);
      window.removeEventListener("touchmove", moveTouch);
      renderer.dispose();
      brushGeometry.dispose();
      imageGeometry.dispose();
      imageMaterial.dispose();
      rippleTexture.dispose();
      heroImageTexture.dispose();
      displacementTarget.dispose();
      brushMeshes.forEach((mesh) => mesh.material.dispose());
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isReady]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none hidden lg:block"
    />
  );
}
