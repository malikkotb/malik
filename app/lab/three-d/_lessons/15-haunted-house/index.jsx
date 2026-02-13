"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import { Sky } from "three/examples/jsm/objects/Sky.js";

import { Timer } from "three/src/core/Timer.js";
export default function ThreeDTextPage() {
  const canvasRef = useRef(null);
  const debugObject = {};

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene
    const scene = new THREE.Scene();

    /* Textures */
    const textureLoader = new THREE.TextureLoader();

    const floorAlphaTexture = textureLoader.load(
      "/demos/textures/floor/alpha.avif"
    );

    const floorColorTexture = textureLoader.load(
      "/demos/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.avif"
    );
    const floorARMTexture = textureLoader.load(
      "/demos/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.avif"
    );
    const floorNormalTexture = textureLoader.load(
      "/demos/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.avif"
    );
    const floorDisplacementTexture = textureLoader.load(
      "/demos/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.avif"
    );

    floorColorTexture.repeat.set(8, 8);
    floorARMTexture.repeat.set(8, 8);
    floorNormalTexture.repeat.set(8, 8);
    floorDisplacementTexture.repeat.set(8, 8);
    floorColorTexture.wrapS = THREE.RepeatWrapping;
    floorColorTexture.wrapT = THREE.RepeatWrapping;
    floorARMTexture.wrapS = THREE.RepeatWrapping;
    floorARMTexture.wrapT = THREE.RepeatWrapping;
    floorNormalTexture.wrapS = THREE.RepeatWrapping;
    floorNormalTexture.wrapT = THREE.RepeatWrapping;
    floorDisplacementTexture.wrapS = THREE.RepeatWrapping;
    floorDisplacementTexture.wrapT = THREE.RepeatWrapping;

    floorColorTexture.colorSpace = THREE.SRGBColorSpace;

    // texture-settings.png // View this image to understand the texture settings

    // Wall textures
    const wallColorTexture = textureLoader.load(
      "/demos/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.avif"
    );
    const wallARMTexture = textureLoader.load(
      "/demos/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.avif"
    );
    const wallNormalTexture = textureLoader.load(
      "/demos/textures/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.avif"
    );

    wallColorTexture.colorSpace = THREE.SRGBColorSpace;

    // Roof textures
    const roofColorTexture = textureLoader.load(
      "/demos/textures/roof/roof_slates_02_1k/roof_slates_02_diff_1k.avif"
    );
    const roofARMTexture = textureLoader.load(
      "/demos/textures/roof/roof_slates_02_1k/roof_slates_02_arm_1k.avif"
    );
    const roofNormalTexture = textureLoader.load(
      "/demos/textures/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.avif"
    );

    roofColorTexture.repeat.set(3, 1);
    roofARMTexture.repeat.set(3, 1);
    roofNormalTexture.repeat.set(3, 1);

    roofColorTexture.wrapS = THREE.RepeatWrapping;
    roofARMTexture.wrapS = THREE.RepeatWrapping;
    roofNormalTexture.wrapS = THREE.RepeatWrapping;

    roofColorTexture.colorSpace = THREE.SRGBColorSpace;

    // Bush textures
    const bushColorTexture = textureLoader.load(
      "/demos/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.avif"
    );
    const bushARMTexture = textureLoader.load(
      "/demos/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.avif"
    );
    const bushNormalTexture = textureLoader.load(
      "/demos/textures/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.avif"
    );

    bushColorTexture.colorSpace = THREE.SRGBColorSpace;

    bushColorTexture.repeat.set(2, 1);
    bushARMTexture.repeat.set(2, 1);
    bushNormalTexture.repeat.set(2, 1);

    bushColorTexture.wrapS = THREE.RepeatWrapping;
    bushARMTexture.wrapS = THREE.RepeatWrapping;
    bushNormalTexture.wrapS = THREE.RepeatWrapping;

    // Grave textures
    // Grave
    const graveColorTexture = textureLoader.load(
      "/demos/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.avif"
    );
    const graveARMTexture = textureLoader.load(
      "/demos/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.avif"
    );
    const graveNormalTexture = textureLoader.load(
      "/demos/textures/grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.avif"
    );

    graveColorTexture.colorSpace = THREE.SRGBColorSpace;

    graveColorTexture.repeat.set(0.3, 0.4);
    graveARMTexture.repeat.set(0.3, 0.4);
    graveNormalTexture.repeat.set(0.3, 0.4);

    // !!! No need to change the wrapS and wrapT when the repeat values are less than 1.

    // Door textures
    const doorColorTexture = textureLoader.load(
      "/demos/textures/door/color.avif"
    );
    const doorAlphaTexture = textureLoader.load(
      "/demos/textures/door/alpha.avif"
    );
    const doorAmbientOcclusionTexture = textureLoader.load(
      "/demos/textures/door/ambientOcclusion.avif"
    );
    const doorHeightTexture = textureLoader.load(
      "/demos/textures/door/height.avif"
    );
    const doorNormalTexture = textureLoader.load(
      "/demos/textures/door/normal.avif"
    );
    const doorMetalnessTexture = textureLoader.load(
      "/demos/textures/door/metalness.avif"
    );
    const doorRoughnessTexture = textureLoader.load(
      "/demos/textures/door/roughness.avif"
    );

    doorColorTexture.colorSpace = THREE.SRGBColorSpace;

    // Debug UI
    const gui = new GUI({ width: 260, title: "Debug UI" });

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // One unit in three.js can mean anything you want
    // having a sepcific unit ratio will help you create geometries
    // 1 unit = 1 meter (in this case)

    /**
     * House
     */
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20, 100, 100),
      new THREE.MeshStandardMaterial({
        alphaMap: floorAlphaTexture,
        transparent: true,
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.3,
        displacementBias: -0.2,
      })
    );

    gui
      .add(floor.material, "displacementScale")
      .min(0)
      .max(1)
      .step(0.0001)
      .name("Floor Displacement Scale");
    gui
      .add(floor.material, "displacementBias")
      .min(-1)
      .max(1)
      .step(0.0001)
      .name("Floor Displacement Bias");

    floor.rotation.x = -Math.PI * 0.5;
    floor.position.y = 0;
    scene.add(floor);

    const houseGroup = new THREE.Group();
    scene.add(houseGroup);

    // walls
    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.5, 4),
      new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        aoMap: wallARMTexture,
        roughnessMap: wallARMTexture,
        metalnessMap: wallARMTexture,
        normalMap: wallNormalTexture,
      })
    );
    walls.position.y += 2.5 / 2; // half of height
    houseGroup.add(walls);

    // roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.5, 1.5, 4),
      new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        aoMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        metalnessMap: roofARMTexture,
        normalMap: roofNormalTexture,
      })
    );
    roof.rotation.y = -Math.PI * 0.25;
    roof.position.y = 2.5 + 0.75; // height of house + half of roof height (cone's origin is at center)
    houseGroup.add(roof);

    // door
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
      new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        roughnessMap: doorRoughnessTexture,
        metalnessMap: doorMetalnessTexture,
        normalMap: doorNormalTexture,
        displacementMap: doorHeightTexture, // add more vertices if dispalcement Map is not applying!!
        displacementScale: 0.15,
        displacementBias: -0.04,
      })
    );
    door.position.y = 1;
    door.position.z = 2.01;
    door.position.x = 0;
    houseGroup.add(door);

    // bushes
    const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
    const bushMaterial = new THREE.MeshStandardMaterial({
      color: "#ccffcc",
      map: bushColorTexture,
      aoMap: bushARMTexture,
      roughnessMap: bushARMTexture,
      metalnessMap: bushARMTexture,
      normalMap: bushNormalTexture,
    });

    const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush1.scale.set(0.5, 0.5, 0.5);
    bush1.position.set(0.8, 0.2, 2.2);
    bush1.rotation.x = -0.75;

    const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush2.scale.set(0.25, 0.25, 0.25);
    bush2.position.set(1.4, 0.1, 2.1);
    bush2.rotation.x = -0.75;

    const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush3.scale.set(0.4, 0.4, 0.4);
    bush3.position.set(-0.8, 0.1, 2.2);
    bush3.rotation.x = -0.75;

    const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
    bush4.scale.set(0.15, 0.15, 0.15);
    bush4.position.set(-1, 0.05, 2.6);
    bush4.rotation.x = -0.75;
    houseGroup.add(bush1, bush2, bush3, bush4);

    // Grave
    const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
    const graveMaterial = new THREE.MeshStandardMaterial({
      map: graveColorTexture,
      aoMap: graveARMTexture,
      roughnessMap: graveARMTexture,
      metalnessMap: graveARMTexture,
      normalMap: graveNormalTexture,
    });
    const graves = new THREE.Group();
    scene.add(graves);

    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 4;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      // Mesh
      const grave = new THREE.Mesh(graveGeometry, graveMaterial);
      grave.position.x = x;
      grave.position.y = Math.random() * 0.4;
      grave.position.z = z;
      grave.rotation.x = (Math.random() - 0.5) * 0.4;
      grave.rotation.y = (Math.random() - 0.5) * 0.4;
      grave.rotation.z = (Math.random() - 0.5) * 0.4;

      // Add to the graves group
      graves.add(grave);
    }

    /**
     * Lights
     */

    // Ambient light
    const ambientLight = new THREE.AmbientLight("#86cdff", 0.275);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight("#86cdff", 1);

    directionalLight.position.set(3, 2, -8);
    scene.add(directionalLight);

    // Door light
    const pointLight = new THREE.PointLight("#ff7d46", 5);
    pointLight.position.set(0, 2.2, 2.5);
    houseGroup.add(pointLight);

    /* Ghosts */
    const ghost1 = new THREE.PointLight("#8800ff", 6);
    const ghost2 = new THREE.PointLight("#ff0088", 6);
    const ghost3 = new THREE.PointLight("#ff0000", 6);
    scene.add(ghost1, ghost2, ghost3);

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
    camera.position.x = 4;
    camera.position.y = 2;
    camera.position.z = 5;
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

    /*
     ** Shadows **
     */
    // activate shadow map
    renderer.shadowMap.enabled = true;
    // set the algorithm to use for the shadow map
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // set on renderer

    directionalLight.castShadow = true;
    ghost1.castShadow = true;
    ghost2.castShadow = true;
    ghost3.castShadow = true;

    walls.castShadow = true;
    walls.receiveShadow = true;
    roof.castShadow = true;
    floor.receiveShadow = true;

    for (const grave of graves.children) {
      grave.castShadow = true;
      grave.receiveShadow = true;
    }

    // Mappings
    directionalLight.shadow.mapSize.width = 256;
    directionalLight.shadow.mapSize.height = 256;
    directionalLight.shadow.camera.top = 8;
    directionalLight.shadow.camera.right = 8;
    directionalLight.shadow.camera.bottom = -8;
    directionalLight.shadow.camera.left = -8;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 20;

    ghost1.shadow.mapSize.width = 256;
    ghost1.shadow.mapSize.height = 256;
    ghost1.shadow.camera.far = 10;

    ghost2.shadow.mapSize.width = 256;
    ghost2.shadow.mapSize.height = 256;
    ghost2.shadow.camera.far = 10;

    ghost3.shadow.mapSize.width = 256;
    ghost3.shadow.mapSize.height = 256;
    ghost3.shadow.camera.far = 10;

    /*
     ** Sky **
     */
    const sky = new Sky();
    sky.scale.setScalar(100);
    scene.add(sky);

    sky.material.uniforms["turbidity"].value = 10;
    sky.material.uniforms["rayleigh"].value = 3;
    sky.material.uniforms["mieCoefficient"].value = 0.1;
    sky.material.uniforms["mieDirectionalG"].value = 0.95;
    sky.material.uniforms["sunPosition"].value.set(
      0.3,
      -0.038,
      -0.95
    );

    /*
     ** Fog **
     */
    scene.fog = new THREE.FogExp2("#02343f", 0.1);

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
    const timer = new Timer();
    let animationFrameId;

    const tick = () => {
      timer.update();
      const elapsedTime = timer.getElapsed();

      // update ghosts
      // Ghosts
      const ghost1Angle = elapsedTime * 0.5;
      ghost1.position.x = Math.cos(ghost1Angle) * 4;
      ghost1.position.z = Math.sin(ghost1Angle) * 4;
      ghost1.position.y =
        Math.sin(ghost1Angle) *
        Math.sin(ghost1Angle * 2.34) *
        Math.sin(ghost1Angle * 3.45);

      const ghost2Angle = -elapsedTime * 0.38;
      ghost2.position.x = Math.cos(ghost2Angle) * 5;
      ghost2.position.z = Math.sin(ghost2Angle) * 5;
      ghost2.position.y =
        Math.sin(ghost2Angle) *
        Math.sin(ghost2Angle * 2.34) *
        Math.sin(ghost2Angle * 3.45);

      const ghost3Angle = elapsedTime * 0.23;
      ghost3.position.x = Math.cos(ghost3Angle) * 6;
      ghost3.position.z = Math.sin(ghost3Angle) * 6;
      ghost3.position.y =
        Math.sin(ghost3Angle) *
        Math.sin(ghost3Angle * 2.34) *
        Math.sin(ghost3Angle * 3.45);

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
