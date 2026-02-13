"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function ThreeScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    /**
     * Base
     */
    // Canvas
    const canvas = canvasRef.current;

    // Scene
    const scene = new THREE.Scene();

    /**
     * Object
     */
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    window.addEventListener("resize", () => {
      // update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // always add this
    });

    window.addEventListener("dblclick", () => {
      const fullscreenElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
          canvas.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.z = 3;
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.setSize(sizes.width, sizes.height);

    /**
     * Animate
     */
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update controls
      controls.update();

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      window.requestAnimationFrame(tick);
    };

    tick();

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", () => {});
      window.removeEventListener("dblclick", () => {});
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className='webgl' />;
}
