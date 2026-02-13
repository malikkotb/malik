"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader";
export default function ThreeDTextPage() {
  const canvasRef = useRef(null);
  const debugObject = {};

  useEffect(() => {
    if (!canvasRef.current) return;

    // Debug UI
    const gui = new GUI({ width: 260, title: "Debug UI" });

    // Scene
    const scene = new THREE.Scene();

    // Environment map
    // const hdrLoader = new HDRLoader();
    // hdrLoader.load(
    //   "/demos/textures/environmentMap/paris.hdr",
    //   (environmentMap) => {
    //     environmentMap.mapping =
    //       THREE.EquirectangularReflectionMapping;
    //     scene.environment = environmentMap;
    //     scene.background = environmentMap;

    //     // Add environment map controls to debug UI
    //     const envFolder = gui.addFolder("Environment");

    //     // Control for environment map intensity
    //     envFolder
    //       .add(renderer, "toneMappingExposure")
    //       .min(0)
    //       .max(5)
    //       .step(0.1)
    //       .name("Env Intensity");

    //     // Toggle environment map as background
    //     const envConfig = {
    //       useAsBackground: true,
    //     };

    //     envFolder
    //       .add(envConfig, "useAsBackground")
    //       .name("Show as Background")
    //       .onChange((value) => {
    //         scene.background = value ? environmentMap : null;
    //       });
    //   }
    // );

    // Axes helper
    const axesHelper = new THREE.AxesHelper();
    scene.add(axesHelper);

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /**
     * Textures
     */
    const textureLoader = new THREE.TextureLoader();
    const matcapTexture = textureLoader.load(
      "/demos/textures/matcaps/9.png"
    );
    matcapTexture.colorSpace = THREE.SRGBColorSpace;

    // Recreating the ilithya website
    // and create a big 3d text in the middle of the scene with objects floating around

    // TextBufferGeometry
    // we need a particular font format called Typeface (that supports 3d text)
    // How to get typeface ?
    // you can convert a font with tools like: https://gero3.github.io/facetype.js/
    // u can also use a font provided by Three.js
    // we can take the fonts from /three/exampes/fonts and put them in the /static/ folder or import them directly

    // Creating a text geometry is long and hard for the computer
    // avoid doing it too many times and keep the geometry as low poly as possible by reducing the curveSegements and bevelSegments
    // remove the wireframe once you are happy with the level of details

    /* Center the text */

    // 1. using bounding
    // the bounding is an information associated with the geometry that tells what space is taken by that geometry
    // it can be a box or a sphere
    // /textures/bounding.png
    // it helps Three.js calculate if the object is on the screen (frustum culling)
    // frsutum culling is about rendering or not rendering objects that are not on the screen

    // if an object is behind the camera (outside the frustum) -> don't render it
    // three.js won't use every vertex of a geometry and test whether its on the screen or not
    // no, they will just use mathematical calculations with box and sphere bounding to know
    // if it's supposed to render this object or not.

    // -> we're going to use the Box bounding to center the geometry

    // by default, three-js uses a sphere bounding
    // calculate the box bounding with computeBoundingBox()
    // the result is an instance of Box3 with min and max properties
    // The min property isn't at 0 because of the bevelThickness and bevelSize
    // -> instead of moving the mesh, we're going to move the whole geometry with translate(...)
    // the mesh will stay in the same position but the geometry will be moved
    // that way when we move/rotate the mesh, it rotates on its center.
    // the whole geometry rotates around its center.

    // the text will centered but its not 100% centered because of the bevelThickness and bevelSize

    // there is a much simpler way -> textGeometry.center() lol

    /* Fonts */
    const fontLoader = new FontLoader();
    fontLoader.load(
      //   "/demos/fonts/helvetiker_regular.typeface.json",
      "/demos/fonts/pp-neue-montreal-medium_medium_regular.json",
      (font) => {
        // console.log(font);
        // create geometry
        const textGeometry = new TextGeometry("Next-level websites", {
          font: font,
          size: 0.5,
          depth: 0.2,
          curveSegments: 5,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 4,
        });
        // create material
        const textMaterial = new THREE.MeshMatcapMaterial({
          matcap: matcapTexture,
        });

        const donutMaterial = new THREE.MeshPhysicalMaterial();

        donutMaterial.metalness = 0;
        donutMaterial.roughness = 0;

        donutMaterial.transmission = 1;
        donutMaterial.ior = 1.5;
        donutMaterial.thickness = 0.5;

        // center the textGeometry
        textGeometry.center();
        textGeometry.computeBoundingBox();

        // Add geometry rotation controls to debug UI
        const geometryFolder = gui.addFolder("Text Geometry");

        const geometryControls = {
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
        };

        // Helper function to update geometry rotation
        const updateGeometryRotation = () => {
          textGeometry.rotateX(geometryControls.rotationX);
          textGeometry.rotateY(geometryControls.rotationY);
          textGeometry.rotateZ(geometryControls.rotationZ);
          // Need to recenter after rotation
          textGeometry.center();
          // Update geometry attributes
          textGeometry.attributes.position.needsUpdate = true;
          textGeometry.attributes.normal.needsUpdate = true;
        };

        geometryFolder
          .add(geometryControls, "rotationX")
          .min(-Math.PI / 4)
          .max(Math.PI / 4)
          .step(0.01)
          .name("Rotate X")
          .onChange(() => {
            updateGeometryRotation();
          });

        geometryFolder
          .add(geometryControls, "rotationY")
          .min(-Math.PI / 4)
          .max(Math.PI / 4)
          .step(0.01)
          .name("Rotate Y")
          .onChange(() => {
            updateGeometryRotation();
          });

        geometryFolder
          .add(geometryControls, "rotationZ")
          .min(-Math.PI / 4)
          .max(Math.PI / 4)
          .step(0.01)
          .name("Rotate Z")
          .onChange(() => {
            updateGeometryRotation();
          });

        // create mesh
        const text = new THREE.Mesh(textGeometry, textMaterial);
        scene.add(text);

        // Create donuts
        const donutGeometry = new THREE.TorusGeometry(
          0.3,
          0.2,
          20,
          45
        );

        for (let i = 0; i < 300; i++) {
          const donut = new THREE.Mesh(donutGeometry, donutMaterial);

          // Random position
          donut.position.x = (Math.random() - 0.5) * 10;
          donut.position.y = (Math.random() - 0.5) * 10;
          donut.position.z = (Math.random() - 0.5) * 10;

          // Random rotation
          donut.rotation.x = Math.random() * Math.PI;
          donut.rotation.y = Math.random() * Math.PI;

          // Random scale
          const scale = Math.random();
          donut.scale.set(scale, scale, scale);

          scene.add(donut);
        }
      }
    );

    /* Lighting */

    const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 100, 100, 100); // color, intensity, width, height
    scene.add(rectAreaLight);

    // // Add ambient light for overall scene illumination
    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    // scene.add(ambientLight);

    // const dirLight = new THREE.DirectionalLight(0xffffff, 10);
    // dirLight.position.set(5, 10, 7.5);
    // scene.add(dirLight);

    // // Add point light for highlights and shadows
    // const pointLight = new THREE.PointLight(0xffffff, 100);
    // pointLight.position.set(2, 3, 4);
    // scene.add(pointLight);

    // // Add point light helper for debugging
    // const pointLightHelper = new THREE.PointLightHelper(
    //   pointLight,
    //   0.2
    // );
    // scene.add(pointLightHelper);

    // // Add light controls to debug UI
    // const lightFolder = gui.addFolder("Lighting");

    // lightFolder
    //   .add(dirLight, "intensity")
    //   .min(0)
    //   .max(100)
    //   .step(0.001)
    //   .name("Direct Intensity");

    // lightFolder
    //   .add(ambientLight, "intensity")
    //   .min(0)
    //   .max(10)
    //   .step(0.001)
    //   .name("Ambient Intensity");

    // lightFolder
    //   .add(pointLight, "intensity")
    //   .min(0)
    //   .max(200)
    //   .step(0.1)
    //   .name("Point Intensity");

    // lightFolder
    //   .add(pointLight.position, "x")
    //   .min(-5)
    //   .max(5)
    //   .step(0.1)
    //   .name("Point Light X");

    // lightFolder
    //   .add(pointLight.position, "y")
    //   .min(-5)
    //   .max(5)
    //   .step(0.1)
    //   .name("Point Light Y");

    // lightFolder
    //   .add(pointLight.position, "z")
    //   .min(-5)
    //   .max(5)
    //   .step(0.1)
    //   .name("Point Light Z");

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

    // Enable physically correct lighting
    renderer.physicallyCorrectLights = true;

    // Configure tone mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
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
      textMaterial.dispose();
      donutMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className='webgl' />;
}
