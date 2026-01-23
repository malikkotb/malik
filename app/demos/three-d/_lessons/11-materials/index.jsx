"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader";
console.log(HDRLoader);

export default function MaterialsPage() {
  const canvasRef = useRef(null);
  const debugObject = {};

  useEffect(() => {
    if (!canvasRef.current) return;

    // Debug UI
    const gui = new GUI({ width: 260, title: "Debug UI" });

    // Scene
    const scene = new THREE.Scene();

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /* Textures */
    const textureLoader = new THREE.TextureLoader();
    const doorColorTexture = textureLoader.load(
      "/demos/textures/door/color.avif"
    );
    const doorAmbientOcclusionTexture = textureLoader.load(
      "/demos/textures/door/ambientOcclusion.avif"
    );
    const doorHeightTexture = textureLoader.load(
      "/demos/textures/door/height.avif"
    );
    const doorRoughnessTexture = textureLoader.load(
      "/demos/textures/door/roughness.avif"
    );
    const doorNormalTexture = textureLoader.load(
      "/demos/textures/door/normal.avif"
    );
    const doorMetalnessTexture = textureLoader.load(
      "/demos/textures/door/metalness.avif"
    );

    const doorAlphaTexture = textureLoader.load(
      "/demos/textures/door/alpha.avif"
    );

    const matcapTexture = textureLoader.load(
      "/demos/textures/matcaps/8.png"
    );

    const gradientTexture = textureLoader.load(
      "/demos/textures/gradients/5.avif" // will render 5 pixels when using NearestFilter and MeshToonMaterial
    );

    const environmentMapTexture = textureLoader.load(
      "/demos/textures/environmentMap/2k.hdr"
    );

    // Change: Textures used as "map" and "matcap" are supposed to be encoded in sRGB color space
    matcapTexture.colorSpace = THREE.SRGBColorSpace;
    doorColorTexture.colorSpace = THREE.SRGBColorSpace;

    // Materials
    // are used to put a color on each visible "pixel" of a geometry
    // algorithms that decide on the color of each pixel are called shaders
    // three.js has many built-in materials with pre-made shaders

    /* Objects */

    /* MeshBasicMaterial */
    // const material = new THREE.MeshBasicMaterial({
    //   map: doorColorTexture,
    // });

    // PROPERTIES of MeshBasicMaterial (can be set in the constructor or after)
    // map: the texture to use
    // material.map = doorColorTexture;

    // color: the color to use, when changing color property directly, you MUST instantiate a new THREE.Color class
    // if we use both color and map, the color will tint the map
    // material.color = new THREE.Color(0xff0000);

    // wireframe: true to render the geometry as a wireframe
    // material.wireframe = true;

    // opacity: 0.5 to make the texture 50% transparent
    // material.transparent = true; // transparent: needs to be true to make the texture transparent
    // material.opacity = 0.5; // opacity value

    // alphaMap
    // material.alphaMap = doorAlphaTexture;
    // when the texture is white, its going to be visible and when its black its going to be hidden

    // side: THREE.DoubleSide to render the texture on both sides of the geometry
    // material.side = THREE.DoubleSide;

    /* MeshNormalMaterial - can be useful to debug the normals */
    // "normals" are information encoded in each vertex that contains the direction of the outisde of the face
    // also just looks great on its own
    // const material = new THREE.MeshNormalMaterial();
    // material.flatShading = true;

    /* MeshMatcapMaterial */
    // looks great while remaining very performant
    // needs a reference texture that looks like a sphere
    // idea is, that the shader of MeshMatcapMaterial is going to use that texture and
    // according to the face it's trying to draw, it will pick the color on the material at the same position
    // meshes appear illuminated, but its an illusion created by the texture
    // the problem is that the result is the same regardless of the camera orientation and we cant update the lights
    // const material = new THREE.MeshMatcapMaterial({
    //   matcap: matcapTexture,
    // });

    // other MATCAPS: https://github.com/nidorx/matcaps?tab=readme-ov-file
    // or create them using blender
    // or using https://www.kchapelier.com/matcap-studio/

    /* MeshDepthMaterial */
    // renders the depth of the geometry
    // the depth is the distance from the camera to the geometry
    // const material = new THREE.MeshDepthMaterial();

    /* MeshLambertMaterial */
    // the most performant material that uses lights
    // but parameters aren't convenient
    // const material = new THREE.MeshLambertMaterial({
    //   color: 0xff0000,
    //   emissive: 0x0000ff,
    //   emissiveIntensity: 3,
    // });

    /* MeshPhongMaterial */
    // less performant (but doesn't matter with so few objects)
    // more paramters
    // const material = new THREE.MeshPhongMaterial({
    //   shininess: 100,
    //   specular: new THREE.Color(0x1188ff),
    // });

    /* MeshToonMaterial */
    // gives cell shading effect (cartoonish style)
    // const material = new THREE.MeshToonMaterial();
    // // NearestFilter: minecraft style, when we want big pixels
    // gradientTexture.minFilter = THREE.NearestFilter;
    // gradientTexture.magFilter = THREE.NearestFilter;
    // // deactivating mipmapping
    // gradientTexture.generateMipmaps = false;
    // material.gradientMap = gradientTexture;

    /* MeshStandardMaterial */
    // // uses physically based rendering (PBR)
    // // supports lights but with a more realisitc algorithm and better parametrers like roughness, metalness
    // const material = new THREE.MeshStandardMaterial();

    // material.metalness = 1;
    // material.roughness = 1;

    // material.map = doorColorTexture;
    // material.aoMap = doorAmbientOcclusionTexture; // will create shade where its dark

    // material.displacementMap = doorHeightTexture; // will move the vertices to create true relief
    // // when its bright (in the texture) the vertices will be moved up
    // // when its dark the vertices will be moved down
    // // need to add more subdivions to properly see the effect

    // material.displacementScale = 0.1; // Starting with a smaller value

    // // instead of specifying uniform metalness and roughness for the whole geometry,
    // // we can use metalnessMap and roughnessMap
    // // the unfirom metalnes and roughness attributes will be multiplied
    // // so set them to 1, when using metalnessMap and roughnessMap

    // material.metalnessMap = doorMetalnessTexture;
    // material.roughnessMap = doorRoughnessTexture;

    // // the normalMap will fake the normal orientation to add details to the surface
    // // regardless of the subdivision
    // material.normalMap = doorNormalTexture;
    // // with normal maps you can have not a lot of vertices and yet still get some crazy
    // // details that react to light ( EVEN without displacementMap)
    // // you can change the normal intensity with the normalScale property (vector2)
    // material.normalScale.set(0.5, 0.5);

    // material.transparent = true; // needs to be true to make the alphaMap work
    // material.alphaMap = doorAlphaTexture;

    /* MeshPhysicalMaterial */
    // same as MeshStandardMaterial but with additional effects (it extends the MeshStandardMaterial class)
    // uses physically based rendering (PBR)
    // supports lights but with a more realisitc algorithm and better parametrers like roughness, metalness
    const material = new THREE.MeshPhysicalMaterial();

    material.metalness = 0;
    material.roughness = 0;
    // material.map = doorColorTexture;
    // material.aoMap = doorAmbientOcclusionTexture; // will create shade where its dark
    // material.displacementMap = doorHeightTexture; // will move the vertices to create true relief
    // material.displacementScale = 0.1; // Starting with a smaller value
    // material.metalnessMap = doorMetalnessTexture;
    // material.roughnessMap = doorRoughnessTexture;
    // material.normalMap = doorNormalTexture;
    // material.normalScale.set(0.5, 0.5);
    // material.transparent = true; // needs to be true to make the alphaMap work
    // material.alphaMap = doorAlphaTexture;

    // gui.add(material, "displacementScale").min(0).max(1).step(0.0001);
    // gui.add(material, "metalness").min(0).max(1).step(0.0001);
    gui.add(material, "roughness").min(0).max(0.6).step(0.0001);

    // Clearcoat
    // simluates a thin layer of varnish on top of the actual material
    // has its own reflective properties while we can still see the default material behind it
    // performance intensive
    // but can get give you crazy realistic results
    // material.clearcoat = 1;
    // material.clearcoatRoughness = 0;

    // gui.add(material, "clearcoat").min(0).max(1).step(0.0001);
    // gui.add(material, "clearcoatRoughness").min(0).max(1).step(0.0001);

    // Sheen
    // highlights the material when seen from a narrow angle
    // usally on fluffy material like fabric
    // material.sheen = 1;
    // material.sheenRoughness = 0.25;
    // material.sheenColor.set(1, 1, 1);
    // gui.add(material, "sheen").min(0).max(1).step(0.0001);
    // gui.add(material, "sheenRoughness").min(0).max(1).step(0.0001);
    // gui.addColor(material, "sheenColor");

    // Iridescence
    // creates color artifacts like a fuel puddle, soap bubbles, or even CD LaserDiscs
    // material.iridescence = 1;
    // material.iridescenceIOR = 1;
    // material.iridescenceThicknessRange = [100, 800];
    // gui.add(material, "iridescence").min(0).max(1).step(0.0001);
    // gui.add(material, "iridescenceIOR").min(0).max(2.33).step(0.0001);
    // gui
    //   .add(material.iridescenceThicknessRange, "0")
    //   .min(1)
    //   .max(1000)
    //   .step(1);
    // gui
    //   .add(material.iridescenceThicknessRange, "1")
    //   .min(1)
    //   .max(1000)
    //   .step(1);

    // Transmission
    // enable light to go through the material
    // more than just transparency with opacity because the image behind the object gets deformed
    material.transmission = 1;
    material.ior = 1.5;
    material.thickness = 0.5;
    gui.add(material, "transmission").min(0).max(1).step(0.0001);
    gui.add(material, "ior").min(0).max(10).step(0.0001);
    gui.add(material, "thickness").min(0).max(1).step(0.0001);
    // => the objects feel trnaslucent (kind of like gummy bears)
    // ior = index of refraction
    // and depends on the type of materual you want to simulate
    // Diamond: 2.417
    // Water: 1.333
    // Air: 1.000293
    // if we only use it with roughness, it will look like a glass


    const sphere = new THREE.Mesh(
      // new TeapotGeometry(0.5, 0.2),
      new THREE.SphereGeometry(0.5, 64, 64),
      material
    );
    sphere.position.x = -1.5;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1, 128, 128), // Added more segments for displacement
      material
    );
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.2, 16, 32),
      material
    );
    torus.position.x = 1.5;

    scene.add(sphere, plane, torus);

    /* Lights */
    // Ambient light is a light that illuminates all objects in the scene equally
    // Directional light is a light that illuminates all objects in the scene from a specific direction
    // Point light is a light that illuminates all objects in the scene from a specific point
    // const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    // scene.add(ambientLight);
    // const pointLight = new THREE.PointLight(0xffffff, 20);
    // pointLight.position.set(2, 3, 4);
    // scene.add(pointLight);

    /* Environment map */
    // like an image of whats surrounding the scene
    // its used to add reflection but also lighting to your objects, in addition
    // to the lighting you added in the scene
    // import using HDRLoader
    // compatible with MeshStandardMaterial, MeshLambertMaterial, MeshPhongMaterial
    const hdrLoader = new HDRLoader();
    hdrLoader.load(
      "/demos/textures/environmentMap/2k.hdr",
      (environmentMap) => {
        environmentMap.mapping =
          THREE.EquirectangularReflectionMapping;
        scene.background = environmentMap;

        // to make it contribute to the lighting of the objects
        scene.environment = environmentMap;
      }
    );

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
      const elapsedTime = clock.getElapsedTime();

      // Update objects
      sphere.rotation.y = 0.1 * elapsedTime;
      plane.rotation.y = 0.1 * elapsedTime;
      torus.rotation.y = 0.1 * elapsedTime;

      sphere.rotation.x = -0.15 * elapsedTime;
      plane.rotation.x = -0.15 * elapsedTime;
      torus.rotation.x = -0.15 * elapsedTime;

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
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className='webgl' />;
}
