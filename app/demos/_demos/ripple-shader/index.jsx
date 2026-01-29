"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import ripple from "./ripple.png";

// Texture URLs for the 3 images
const textureUrls = ['/demos/img1.png', '/demos/img4.png', '/demos/img3.png'];

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
    renderer.setClearColor(0xffffff, 1);

    containerRef.current.appendChild(renderer.domElement);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;

    let mouse = new THREE.Vector2(0, 0);
    let prevMouse = new THREE.Vector2(0, 0);
    let currentWave = 0;

    const moveMouse = (event) => {
      mouse.x = event.clientX - sizes.width / 2;
      mouse.y = sizes.height / 2 - event.clientY;
    };

    window.addEventListener("mousemove", moveMouse);

    // Create plane geometry (1x1 base, scaled via mesh.scale)
    const geometry = new THREE.PlaneGeometry(64, 64, 1, 1);

    // Layout configuration - fixed dimensions with 4:5 aspect ratio
    const numQuads = 3;

    // Fixed dimensions - 4:5 aspect ratio (width:height)
    let quadWidth = 360;  // Fixed width in pixels
    let quadHeight = quadWidth * (5 / 4);  // Height based on 4:5 ratio

    // Calculate spacing based on fixed quad dimensions
    let gapSize = 42;  // Fixed gap between images
    const totalGaps = (numQuads - 1) * gapSize;
    const totalQuadWidth = numQuads * quadWidth + totalGaps;
    let edgePadding = (sizes.width - totalQuadWidth) / 2;

    // Create geometry for quads
    let quadGeometry = new THREE.PlaneGeometry(quadWidth, quadHeight, 1, 1);

    // Create shader materials array
    const materials = [];
    const quads = [];
    const textureLoader = new THREE.TextureLoader();

    // Start from left edge + padding + half quad width
    let startX = -sizes.width / 2 + edgePadding + quadWidth / 2;

    textureUrls.forEach((url, index) => {
      const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uTexture: {
            value: textureLoader.load(url, (tex) => {
              const imgAspect = tex.image.width / tex.image.height;
              const quadAspect = quadWidth / quadHeight;
              material.uniforms.resolution.value.set(
                quadWidth,
                quadHeight,
                quadAspect > imgAspect ? 1 : imgAspect / quadAspect,
                quadAspect > imgAspect ? quadAspect / imgAspect : 1
              );
            })
          },
          uDisplacement: { value: null },
          resolution: { value: new THREE.Vector4() },
          uQuadOffset: { value: new THREE.Vector2() },
          uQuadSize: { value: new THREE.Vector2() },
        },
      });

      // Calculate quad position
      const posX = startX + index * (quadWidth + gapSize);

      // Calculate screen-space UV offset and size for global ripple effect
      const normalizedX = (posX + sizes.width / 2 - quadWidth / 2) / sizes.width;
      const normalizedY = (sizes.height / 2 - quadHeight / 2) / sizes.height;
      material.uniforms.uQuadOffset.value.set(normalizedX, normalizedY);
      material.uniforms.uQuadSize.value.set(quadWidth / sizes.width, quadHeight / sizes.height);

      materials.push(material);

      // Create and position quad
      const quad = new THREE.Mesh(quadGeometry, material);
      quad.position.x = posX;
      quad.position.y = 0;
      scene1.add(quad);
      quads.push(quad);
    });

    const maxWaves = 100;
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

      // Update all materials
      materials.forEach((mat) => {
        mat.uniforms.uTime.value = elapsedTime;
      });

      // Update controls
      controls.update();

      // Render ripple brushes to texture (needs black background for displacement)
      renderer.setClearColor(0x000000, 1);
      renderer.setRenderTarget(baseTexture);
      renderer.clear();
      renderer.render(scene, camera);

      // Update displacement for all materials
      materials.forEach((mat) => {
        mat.uniforms.uDisplacement.value = baseTexture.texture;
      });

      // Render final scene with white background
      renderer.setClearColor(0xffffff, 1);
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene1, camera);

      meshes.forEach((mesh) => {
        if (mesh.visible) {
          // Mouse coordinates are already in world space (pixels centered at 0,0)
          // mesh.position.x = mouse.x;
          // mesh.position.y = mouse.y;

          mesh.rotation.z += 0.01;
          mesh.material.opacity *= 0.96;

          // simulates really slow exponential growth, but not linear (easing curve)
          mesh.scale.x = 0.982 * mesh.scale.x + 0.108;
          // mesh.scale.y = 0.98 * mesh.scale.y + 0.1;
          mesh.scale.y = mesh.scale.x;

          if (mesh.material.opacity < 0.002) {
            mesh.visible = false;
          }
        }
      });

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

      // Update render target
      baseTexture.setSize(sizes.width, sizes.height);

      // Keep fixed dimensions with 4:5 aspect ratio
      quadWidth = 360;
      quadHeight = quadWidth * (5 / 4);

      // Recalculate spacing
      gapSize = 42;
      const newTotalGaps = (numQuads - 1) * gapSize;
      const totalQuadWidth = numQuads * quadWidth + newTotalGaps;
      edgePadding = (sizes.width - totalQuadWidth) / 2;

      // Update geometry
      quadGeometry.dispose();
      quadGeometry = new THREE.PlaneGeometry(quadWidth, quadHeight, 1, 1);

      // Update starting X position with edge padding
      startX = -sizes.width / 2 + edgePadding + quadWidth / 2;

      // Update all quads and materials
      quads.forEach((quad, index) => {
        quad.geometry = quadGeometry;
        const posX = startX + index * (quadWidth + gapSize);
        quad.position.x = posX;

        const mat = materials[index];

        // Update screen-space UV offset and size
        const normalizedX = (posX + sizes.width / 2 - quadWidth / 2) / sizes.width;
        const normalizedY = (sizes.height / 2 - quadHeight / 2) / sizes.height;
        mat.uniforms.uQuadOffset.value.set(normalizedX, normalizedY);
        mat.uniforms.uQuadSize.value.set(quadWidth / sizes.width, quadHeight / sizes.height);

        // Update resolution for aspect ratio
        const tex = mat.uniforms.uTexture.value;
        if (tex.image) {
          const imgAspect = tex.image.width / tex.image.height;
          const quadAspect = quadWidth / quadHeight;
          mat.uniforms.resolution.value.set(
            quadWidth,
            quadHeight,
            quadAspect > imgAspect ? 1 : imgAspect / quadAspect,
            quadAspect > imgAspect ? quadAspect / imgAspect : 1
          );
        }
      });
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", moveMouse);
      controls.dispose();
      renderer.dispose();
      geometry.dispose();
      quadGeometry.dispose();
      materials.forEach((mat) => mat.dispose());
      baseTexture.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className='w-full fixed top-0 left-0' />
  );
}
