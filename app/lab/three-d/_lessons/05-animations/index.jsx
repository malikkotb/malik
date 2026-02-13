"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

export default function ThreeScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Canvas
    const canvas = canvasRef.current;

    // Scene
    const scene = new THREE.Scene();

    // Object
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Sizes
    const sizes = {
      width: 800,
      height: 600,
    };

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height
    );
    camera.position.z = 3;
    scene.add(camera);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.setSize(sizes.width, sizes.height);

    // animate
    // requestAnimationFrame is to call the function provided on the next frame
    // we are going to call the same function on each new frame

    // Adaptation to the framerate
    // To adapt the animation to the framerate, we need to know how much time it's been since the last tick.
    // let time = Date.now();

    // we can also use the clock
    const clock = new THREE.Clock();

    gsap.to(mesh.position, { duration: 1, delay: 1, x: 2 });

    const animate = () => {
      // update objects (-> animate them)

      // the higher the fps (frame rate), the faster the rotation -> need to adapt with delta using time
      // const currentTime = Date.now();
      // const deltaTime = currentTime - time;
      // time = currentTime;
      // mesh.rotation.y += 0.001 * deltaTime;

      // elapsed time will always continue to increment
      const elapsedTime = clock.getElapsedTime();
      // mesh.rotation.y = elapsedTime * Math.PI * 2; // to have a full rotation every second

      // cube doing circles
      // mesh.position.y = Math.sin(elapsedTime);
      // mesh.position.x = Math.cos(elapsedTime);

      // same result, but the camera is moving around the cube
      // camera.position.y = Math.sin(elapsedTime * 2);
      // camera.position.x = Math.cos(elapsedTime * 2);

      // look at the cube while rotating the camera
      // camera.lookAt(mesh.position);

      // dont use getDelta()

      renderer.render(scene, camera);

      window.requestAnimationFrame(animate); // its a recursive function
    };

    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className='webgl' />;
}
