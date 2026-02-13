"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Canvas
    const canvas = canvasRef.current;

    // Scene
    const scene = new THREE.Scene();

    /**
     * Objects
     */
    /*const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    */

    // Position
    // mesh.position.x = 0.7;
    // mesh.position.y = -0.6;
    // mesh.position.y = 1;
    // mesh.position.set(0.7, -0.6, 1); // to set all the properties at once

    // one group with three cubes inside that group
    const group = new THREE.Group();
    group.position.y = 1;
    group.scale.y = 2;
    // that way you can build cities, buildings, etc.
    scene.add(group);

    const cube1 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    group.add(cube1);

    const cube2 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    cube2.position.x = -2;
    group.add(cube2);

    const cube3 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0x0000ff })
    );
    cube3.position.x = 2;
    group.add(cube3);

    // axes helper is a helper object that helps us visualize the axes of the scene
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper); // since its an object, we need to add it to the scene!!

    // scale
    // mesh.scale.x = 2;
    // mesh.scale.y = 0.5;
    // mesh.scale.z = 0.5;
    // mesh.scale.set(2, 0.5, 0.5); // to set all the properties at once

    // rotation with either rotation or quaternion
    // updating one will automatically update the other
    // rotation uses Euler angles
    // one full 360 degrees rotation is 2PI (3.14 * 2)

    // mesh.rotation.x = Math.PI * 1; // 180 degrees
    // mesh.rotation.y = 3.14159 * .5; // 90 degrees

    // mesh.rotation.x = 1;
    // mesh.rotation.x = 3.14159 * 1; // 180 degrees

    // mesh.rotation.y = Math.PI * .25; // 90 degrees

    // mesh.rotation.z = 1;
    // mesh.rotation.set(1, 1, 1); // to set all the properties at once

    // be careful when u rotate on an axis, as you might also rotate the other axes!!
    // the rotation goes by default in the x,y and z order and you can get strainge results like an axis not working anymore
    // this is called gimbal lock

    // what to do to fix that?
    // you can change the order by using reorder() method
    // object.rotation.reorder('YXZ');
    // do it BEFORE changing the rotation

    // Quaternion also expresses a rotation in 3D space, but in a more mathematical way
    // it is a 4D vector
    // mesh.quaternion.set(1, 1, 1, 1); // to set all the properties at once

    /**
     * Sizes
     */
    const sizes = {
      width: 800,
      height: 600,
    };

    /**
     * Camera
     */
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height
    );
    camera.position.z = 3;
    // camera.position.y = 1;
    // camera.position.x = 1;
    scene.add(camera);

    // lookAt() is a method that allows you to set the camera's position to look at a specific point in the scene
    // camera.lookAt(new THREE.Vector3(3, 0, 0));
    // camera.lookAt(mesh.position);

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    renderer.setSize(sizes.width, sizes.height);

    // render.render() is like saying take a picture of the scene from the camera
    // all transforms and animations have to happen before this call
    renderer.render(scene, camera);

    // Cleanup
    return () => {
      renderer.dispose();
      cube1.geometry.dispose();
      cube1.material.dispose();
      cube2.geometry.dispose();
      cube2.material.dispose();
      cube3.geometry.dispose();
      cube3.material.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className='webgl' />;
}
