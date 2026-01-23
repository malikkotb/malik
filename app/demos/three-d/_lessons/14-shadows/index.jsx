"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
export default function ThreeDTextPage() {
  const canvasRef = useRef(null);
  const debugObject = {};

  useEffect(() => {
    if (!canvasRef.current) return;

    /* Textures */
    const textureLoader = new THREE.TextureLoader();
    const bakedShadowTexture = textureLoader.load(
      "/demos/textures/shadows/bakedShadow.avif"
    );
    const simpleShadowTexture = textureLoader.load(
      "/demos/textures/shadows/simpleShadow.avif"
    );
    // Textures used as map and matcap are supposed to be encoded in sRGB. !!!
    // In the latest versions of Three.js we need to specify it by setting their colorSpace to THREE.SRGBColorSpace:
    bakedShadowTexture.colorSpace = THREE.SRGBColorSpace;

    // Debug UI
    const gui = new GUI({ width: 260, title: "Debug UI" });

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Scene
    const scene = new THREE.Scene();

    /**
     * Lights
     */
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    gui.add(ambientLight, "intensity").min(0).max(3).step(0.001);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      0.5
    );
    directionalLight.position.set(2, 2, -1);
    gui.add(directionalLight, "intensity").min(0).max(3).step(0.001);
    gui
      .add(directionalLight.position, "x")
      .min(-5)
      .max(5)
      .step(0.001);
    gui
      .add(directionalLight.position, "y")
      .min(-5)
      .max(5)
      .step(0.001);
    gui
      .add(directionalLight.position, "z")
      .min(-5)
      .max(5)
      .step(0.001);
    scene.add(directionalLight);

    directionalLight.castShadow = true;

    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 6;

    directionalLight.shadow.camera.top = 2;
    directionalLight.shadow.camera.right = 2;
    directionalLight.shadow.camera.bottom = -2;
    directionalLight.shadow.camera.left = -2;

    /* Shadows */
    // dark shadows in the back of objects are called core shadows
    // -> what we are missing is drop shadows

    // when u do one render, three.js will do a render for each light supportin shadows
    // those renders will simulate what the light sees as if it was a camera
    // during these light renders, a MeshDepthMaterial replaces all mesh materials
    // the light renders are stored as textures (-> shadow maps)
    // they are then used on all the materials that are supposed to receive shadows and projected on the geometry

    // example: https://threejs.org/examples/webgl_shadowmap_viewer.htmls

    // how to activate shadows
    // renderer.shadowMap.enabled = true;
    // go through each object and devicide if object can cast shadows, and objects that receive shadows
    // object.castShadow = true; object.receiveShadow = true;
    // only following types of lights support shadows: pointlight, directionallight, spotlight
    // activate the shadows on the light with: light.castShadow = true;

    // Shadow Map optimizations
    // render size: bigger is better, but more expensive
    // by default its 512x512, keep it in a power of 2 for mipmapping

    // Near and Far
    // to see near and far plane, we can use the camera helper

    // to help us debug, we can use a CameraHelper with the camera used for the shadow map located in directionalLight.shadow.camera
    const directionalLightCameraHelper = new THREE.CameraHelper(
      directionalLight.shadow.camera
    );
    // scene.add(directionalLightCameraHelper);

    // Amplitude
    // we can see from cameraHelper, that the amplitude is too large
    // bc. we are using a directional light, three.js is using an OrthographicCamera
    // we can control how far on each side the camera can see with directionalLight.shadow.camera.left, right, top, bottom
    // the smaller the values, the more precise the shadows will be
    // If it's too small, the shadows will be cropped

    // Blur
    // you can control the shadow blur with radius property
    directionalLight.shadow.radius = 10;
    // this technique doesnt use the proximity of the camera with the object; it's a general and cheap blur

    // Shadow Map algorithm
    // different types of algorithms can be applied to shadow maps
    // THREE. BasicShadowMap -Very performant but lousy quality
    // THREE.PCFShadowMap -Less performant but smoother edges (default)
    // THREE.PCFSoftShadowMap — Less performant but even softer edges
    // THREE.VSMShadowMap —Less performant, more constraints, can have unexpected results
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // set on renderer
    // the radius doesnt work with the PCFSoftShadowMap though

    // Spot Light

    const spotLight = new THREE.SpotLight(
      0xffffff,
      3.6,
      10,
      Math.PI * 0.3
    );
    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 6;

    spotLight.position.set(0, 2, 2);
    scene.add(spotLight);
    scene.add(spotLight.target);

    const spotLightCameraHelper = new THREE.CameraHelper(
      spotLight.shadow.camera
    );
    // scene.add(spotLightCameraHelper);

    /* Point Light */
    const pointLight = new THREE.PointLight(0xffffff, 2.7);
    pointLight.castShadow = true;

    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 5;

    pointLight.position.set(-1, 1, 0);
    scene.add(pointLight);

    const pointLightCameraHelper = new THREE.CameraHelper(
      pointLight.shadow.camera
    );
    // scene.add(pointLightCameraHelper);

    // Baking Shadows
    // similar to baking lightmaps
    // you integrate shadows in textures that we apply on materials
    // and then add to plane material for example
    // problem is you cant change position of that shadow later ( they are static)

    // Baking Shadow alternatives
    // using simpleShadow.avif as shadow map; it's just a diffuse light/gradient that we'll use to put ona plane below our object
    // and when our object moves, we'll move the plane with it
    // and if object goes up, we can reduce the alpha of the shadow texture to make it look like it's going up

    /**
     * Materials
     */
    const material = new THREE.MeshStandardMaterial();
    material.roughness = 0.7;
    gui.add(material, "metalness").min(0).max(1).step(0.001);
    gui.add(material, "roughness").min(0).max(1).step(0.001);

    /**
     * Objects
     */
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      material
    );

    sphere.castShadow = true;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      material
      //   new THREE.MeshStandardMaterial({ // for baked shadows
      //     map: bakedShadowTexture,
      //   })
    );
    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = -0.5;

    plane.receiveShadow = true;

    scene.add(sphere, plane);

    // create a plane slightly above the floow with an alphaMap using the simpleSHadow
    // bc if u put 2 planes at the same place, you get a glitch called z-fighting
    const sphereShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.5),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        alphaMap: simpleShadowTexture,
        transparent: true,
      })
    );
    // position right under the sphere, but slightly above the floor
    sphereShadow.rotation.x = -Math.PI * 0.5;
    sphereShadow.position.y = plane.position.y + 0.01;
    scene.add(sphereShadow);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.x = 1;
    camera.position.y = 1;
    camera.position.z = 2;
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // activate shadow map
    renderer.shadowMap.enabled = false; // deactivate if u want to use baking shadoes instead

    // set the algorithm to use for the shadow map
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // set on renderer

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
      const elapsedTime = clock.getElapsedTime();

      // update sphere
      sphere.position.x = Math.cos(elapsedTime) * 1.5;
      sphere.position.z = Math.sin(elapsedTime) * 1.5;
      sphere.position.y = Math.abs(Math.sin(elapsedTime * 3)); // mathematical way of creating a bouncing effect

      // update sphereShadow
      sphereShadow.position.x = sphere.position.x;
      sphereShadow.position.z = sphere.position.z;
      sphereShadow.material.opacity = 1 - sphere.position.y;

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
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className='webgl' />;
}
