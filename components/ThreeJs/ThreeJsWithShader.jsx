"use client";
import { useEffect, useState, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

export default function ThreeJsWithShader() {
  const [count, setCount] = useState(0);
  const canvasRef = useRef(null);

  // ThreeJS boilerplate
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);

    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      10
    );

    camera.position.z = 1;

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Create and add cube
    const geometry = new THREE.PlaneGeometry(1, 1, 50, 50);

    let material = new THREE.MeshNormalMaterial();

    material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      //   wireframe: true, // to see the wireframe of the shader
    });

    // this is the normal mesh rendering
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    // instead we can use particle rendering:

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animation loop
    const animate = (time) => {
      requestAnimationFrame(animate);

      // Update time uniform (convert to seconds)
      material.uniforms.time.value = time * 0.001;

      // Update controls
      controls.update();

      renderer.render(scene, camera);
    };

    // Start animation
    animate(0);

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      scene.remove(particles);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className='flex flex-col w-full h-full'>
      <canvas ref={canvasRef} className='w-full h-full' />
    </div>
  );
}
