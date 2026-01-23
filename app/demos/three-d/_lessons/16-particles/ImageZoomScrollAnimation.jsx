"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import { Timer } from "three/src/core/Timer.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";

export default function Particles() {
  const canvasRef = useRef(null);
  const debugObject = {};

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene
    const scene = new THREE.Scene();

    /* Textures */
    // Image textures
    const textureLoader = new THREE.TextureLoader();
    const particleTexture1 = textureLoader.load(
      "/demos/textures/image1.png"
    );
    const particleTexture2 = textureLoader.load(
      "/demos/textures/image2.png"
    );
    const particleTexture3 = textureLoader.load(
      "/demos/textures/image3.png"
    );
    const particleTexture4 = textureLoader.load(
      "/demos/textures/image4.png"
    );
    const particleTexture5 = textureLoader.load(
      "/demos/textures/image5.png"
    );
    const particleTexture6 = textureLoader.load(
      "/demos/textures/image6.png"
    );

    // Video textures
    const createVideoTexture = (videoPath) => {
      const video = document.createElement("video");
      video.src = videoPath;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.play();

      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBAFormat;
      return texture;
    };

    const videoTexture1 = createVideoTexture(
      "/demos/textures/videos/video1.mov"
    );
    const videoTexture2 = createVideoTexture(
      "/demos/textures/videos/video2.mov"
    );
    const videoTexture3 = createVideoTexture(
      "/demos/textures/videos/video3.mov"
    );
    const videoTexture4 = createVideoTexture(
      "/demos/textures/videos/video4.mov"
    );
    const videoTexture5 = createVideoTexture(
      "/demos/textures/videos/video5.mov"
    );

    // Debug UI
    const gui = new GUI({ width: 260, title: "Debug UI" });

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /* Particles */
    // Particles can be used to create effects like stars, rain, dust,smoke, fire, etc.
    // u can have thousands of them with a reasonable frame rate
    // each particle is composed of a plane (two triagnles) always facing the camera
    // Creating particles in three.js is like creating a mesh
    // - a geometry (BufferGeometry)
    // - a material (PointsMaterial)
    // - a Points instance (instead of a Mesh)

    // Particles geometry
    const particlesGeometry = new BufferGeometry(1, 32, 32);
    const count = 20;

    const positions = new Float32Array(count * 3);
    const textureIndices = new Float32Array(count);
    const scales = new Float32Array(count * 2); // x and y scale for each particle

    // For each particle, set position, texture index, and scale
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 75; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 75; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 75; // z

      // Assign random texture index (0 to 5)
      textureIndices[i] = Math.floor(Math.random() * 6);

      // Set scale - if texture index is 3, make it rectangular (1:2 ratio)
      const isRectangular = textureIndices[i] === 3;
      scales[i * 2] = 1.0; // width scale
      scales[i * 2 + 1] = isRectangular ? 2.0 : 1.0; // height scale
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    particlesGeometry.setAttribute(
      "textureIndex",
      new THREE.BufferAttribute(textureIndices, 1)
    );

    particlesGeometry.setAttribute(
      "scale",
      new THREE.BufferAttribute(scales, 2)
    );

    // add images / videos to particles and then use gsap to zoom in on entire canvas on scroll

    // Create array of textures to randomly select from (mix of images and videos)
    const textures = [
      particleTexture1,
      particleTexture2,
      videoTexture1,
      videoTexture2,
      particleTexture3,
      videoTexture3,
    ];

    // Create array to store random textures for each particle
    const particleTextures = [];
    for (let i = 0; i < count; i++) {
      particleTextures.push(
        textures[Math.floor(Math.random() * textures.length)]
      );
    }

    // Custom shader material for multiple textures
    const particlesMaterial = new THREE.ShaderMaterial({
      //   transparent: true,
      depthWrite: false,
      uniforms: {
        size: { value: 20.0 },
        textures: { value: textures },
      },
      vertexShader: `
        attribute float textureIndex;
        attribute vec2 scale;
        varying float vTextureIndex;
        varying vec2 vScale;
        uniform float size;

        void main() {
          vTextureIndex = textureIndex;
          vScale = scale;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Base size with perspective
          float baseSize = size * (300.0 / -mvPosition.z);
          
          // Apply the larger scale to the point size
          gl_PointSize = baseSize * max(scale.x, scale.y);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        #define MAX_TEXTURES 6
        uniform sampler2D textures[MAX_TEXTURES];
        varying float vTextureIndex;
        varying vec2 vScale;

        void main() {
          // Transform UV coordinates based on scale
          vec2 uv = gl_PointCoord;
          
          // Adjust UVs based on scale to maintain aspect ratio
          uv = (uv - 0.5) * 2.0; // Convert to -1 to 1 range
          uv.x = uv.x * (vScale.y / vScale.x);
          uv = (uv * 0.5) + 0.5; // Convert back to 0 to 1 range
          
          // Discard fragments outside the scaled rectangle
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            discard;
          }

          int index = int(mod(vTextureIndex, float(MAX_TEXTURES)));
          vec4 color;
          
          // Use if statements for WebGL 1 compatibility
          if(index == 0) color = texture2D(textures[0], uv);
          else if(index == 1) color = texture2D(textures[1], uv);
          else if(index == 2) color = texture2D(textures[2], uv);
          else if(index == 3) color = texture2D(textures[3], uv);
          else if(index == 4) color = texture2D(textures[4], uv);
          else color = texture2D(textures[5], uv);

          gl_FragColor = color;
        }
      `,
    });

    // Points
    const particles = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particles);

    // Add particle size control to debug UI
    gui
      .add(particlesMaterial.uniforms.size, "value")
      .min(10)
      .max(30)
      .step(0.1)
      .name("Particle Size");

    /**
     * Lights
     */
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
    directionalLight.position.set(1, 2, 0);
    scene.add(directionalLight);

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
    camera.position.z = 100;
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

      // Cleanup video elements
      textures.forEach((texture) => {
        if (texture instanceof THREE.VideoTexture) {
          const video = texture.source.data;
          video.pause();
          video.remove();
        }
      });
    };
  }, []);

  return (
    <div className='h-screen w-screen fixed top-0 left-0'>
      <canvas ref={canvasRef} className='webgl' />
    </div>
  );
}
