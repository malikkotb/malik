"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function GeometriesPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene
    const scene = new THREE.Scene();

    // Object
    // const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);

    const geometry = new THREE.BufferGeometry();

    const count = 500;

    const positionsArray = new Float32Array(count * 3 * 3);
    // count(# of triangles) and each triangle has 3 vertices (* 3)
    // and each vertex has 3 values (x, y, z) (* 3 again)

    for (let i = 0; i < count * 3 * 3; i++) {
      positionsArray[i] = Math.random() - 0.5; // -0.5 to 0.5
    }

    const positionsAttribute = new THREE.BufferAttribute(
      positionsArray,
      3
    );

    geometry.setAttribute("position", positionsAttribute);

    // One interesting thing with BufferGeometry is that you can mutualize
    // vertices using the index property. Consider a cube.
    // Multiple faces can use some vertices like the ones in the corners.
    // And if you look closely, every vertex can be used by various neighbor triangles.
    // That will result in a smaller attribute array and performance improvement.

    const material = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

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

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
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

    // Animate
    const clock = new THREE.Clock();
    let animationFrameId;

    const tick = () => {
      // const elapsedTime = clock.getElapsedTime();

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
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className='webgl' />;
}
