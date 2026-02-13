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
    scene.background = new THREE.Color("#fff");

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
    // const gui = new GUI({ width: 260, title: "Debug UI" });

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
    const count = 100;

    const positions = new Float32Array(count * 3);
    const textureIndices = new Float32Array(count);
    const scales = new Float32Array(count * 2); // x and y scale for each particle
    const zIndices = new Float32Array(count); // z-index for layering

    // For each particle, set position, texture index, and scale
    const spreadRange = 75 * 2; // Increase spread by 10%
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spreadRange; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * spreadRange; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * spreadRange; // z

      // Assign random texture index (0 to 10 for all 11 textures)
      textureIndices[i] = Math.floor(Math.random() * 11);

      // Set scale - can customize based on texture index if needed
      scales[i * 2] = 1.0; // width scale
      scales[i * 2 + 1] = 1.0; // height scale
      
      // Default z-index (0 = normal, 1 = on top)
      zIndices[i] = 0.0;
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

    particlesGeometry.setAttribute(
      "zIndex",
      new THREE.BufferAttribute(zIndices, 1)
    );

    // add images / videos to particles and then use gsap to zoom in on entire canvas on scroll

    // Create array of textures to randomly select from (all 6 images + 5 videos)
    const textures = [
      particleTexture1,
      particleTexture2,
      particleTexture3,
      particleTexture4,
      particleTexture5,
      particleTexture6,
      videoTexture1,
      videoTexture2,
      videoTexture3,
      videoTexture4,
      videoTexture5,
    ];

    // Custom shader material for multiple textures
    const particlesMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: true,
      depthTest: true,
      uniforms: {
        size: { value: 30.0 },
        textures: { value: textures },
      },
      vertexShader: `
        attribute float textureIndex;
        attribute vec2 scale;
        attribute float zIndex;
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
          
          // Push focused particle closer to camera (lower z in clip space = closer)
          gl_Position.z -= zIndex * 0.1;
        }
      `,
      fragmentShader: `
        #define MAX_TEXTURES 11
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
          
          // Use if statements for WebGL 1 compatibility - handle all 11 textures
          if(index == 0) color = texture2D(textures[0], uv);
          else if(index == 1) color = texture2D(textures[1], uv);
          else if(index == 2) color = texture2D(textures[2], uv);
          else if(index == 3) color = texture2D(textures[3], uv);
          else if(index == 4) color = texture2D(textures[4], uv);
          else if(index == 5) color = texture2D(textures[5], uv);
          else if(index == 6) color = texture2D(textures[6], uv);
          else if(index == 7) color = texture2D(textures[7], uv);
          else if(index == 8) color = texture2D(textures[8], uv);
          else if(index == 9) color = texture2D(textures[9], uv);
          else color = texture2D(textures[10], uv);

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
    // gui
    //   .add(particlesMaterial.uniforms.size, "value")
    //   .min(10)
    //   .max(30)
    //   .step(0.1)
    //   .name("Particle Size");

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

    // Raycaster for click detection
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 5; // Adjust click sensitivity
    const mouse = new THREE.Vector2();

    // Store original positions for each particle
    const originalPositions = new Float32Array(positions);
    
    // Track focused particle state
    let focusedParticleIndex = -1;
    let isAnimating = false;

    // Handle click on particles
    const onClick = (event) => {
      if (isAnimating) return;

      // Calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / sizes.width) * 2 - 1;
      mouse.y = -(event.clientY / sizes.height) * 2 + 1;

      // Update the raycaster
      raycaster.setFromCamera(mouse, camera);

      // Check for intersections with particles
      const intersects = raycaster.intersectObject(particles);

      if (intersects.length > 0) {
        const clickedIndex = intersects[0].index;
        
        // If clicking the same particle that's focused, return it to original position
        if (clickedIndex === focusedParticleIndex) {
          isAnimating = true;
          
          const positionAttribute = particlesGeometry.getAttribute("position");
          const zIndexAttribute = particlesGeometry.getAttribute("zIndex");
          const ox = originalPositions[clickedIndex * 3];
          const oy = originalPositions[clickedIndex * 3 + 1];
          const oz = originalPositions[clickedIndex * 3 + 2];

          gsap.to(
            { 
              x: positionAttribute.getX(clickedIndex),
              y: positionAttribute.getY(clickedIndex),
              z: positionAttribute.getZ(clickedIndex)
            },
            {
              x: ox,
              y: oy,
              z: oz,
              duration: 0.8,
              ease: "power2.inOut",
              onUpdate: function() {
                positionAttribute.setXYZ(clickedIndex, this.targets()[0].x, this.targets()[0].y, this.targets()[0].z);
                positionAttribute.needsUpdate = true;
              },
              onComplete: () => {
                // Reset z-index when unfocusing
                zIndexAttribute.setX(clickedIndex, 0.0);
                zIndexAttribute.needsUpdate = true;
                focusedParticleIndex = -1;
                isAnimating = false;
              }
            }
          );
        } else {
          // If there's already a focused particle, return it first
          if (focusedParticleIndex !== -1) {
            const prevIndex = focusedParticleIndex;
            const positionAttribute = particlesGeometry.getAttribute("position");
            const zIndexAttribute = particlesGeometry.getAttribute("zIndex");
            const ox = originalPositions[prevIndex * 3];
            const oy = originalPositions[prevIndex * 3 + 1];
            const oz = originalPositions[prevIndex * 3 + 2];

            // Reset z-index of previous particle
            zIndexAttribute.setX(prevIndex, 0.0);
            zIndexAttribute.needsUpdate = true;

            gsap.to(
              { 
                x: positionAttribute.getX(prevIndex),
                y: positionAttribute.getY(prevIndex),
                z: positionAttribute.getZ(prevIndex)
              },
              {
                x: ox,
                y: oy,
                z: oz,
                duration: 0.5,
                ease: "power2.out",
                onUpdate: function() {
                  positionAttribute.setXYZ(prevIndex, this.targets()[0].x, this.targets()[0].y, this.targets()[0].z);
                  positionAttribute.needsUpdate = true;
                }
              }
            );
          }

          // Move clicked particle to center (in front of camera)
          isAnimating = true;
          focusedParticleIndex = clickedIndex;
          
          const positionAttribute = particlesGeometry.getAttribute("position");
          const zIndexAttribute = particlesGeometry.getAttribute("zIndex");
          
          // Set z-index to render on top
          zIndexAttribute.setX(clickedIndex, 1.0);
          zIndexAttribute.needsUpdate = true;
          
          // Calculate center position in front of camera based on where camera is looking
          const cameraDirection = new THREE.Vector3();
          camera.getWorldDirection(cameraDirection);
          
          // Position the particle 30 units in front of the camera along its view direction
          const distanceFromCamera = 30;
          const targetPosition = new THREE.Vector3()
            .copy(camera.position)
            .add(cameraDirection.multiplyScalar(distanceFromCamera));
          
          gsap.to(
            { 
              x: positionAttribute.getX(clickedIndex),
              y: positionAttribute.getY(clickedIndex),
              z: positionAttribute.getZ(clickedIndex)
            },
            {
              x: targetPosition.x,
              y: targetPosition.y,
              z: targetPosition.z,
              duration: 0.8,
              ease: "power2.inOut",
              onUpdate: function() {
                positionAttribute.setXYZ(clickedIndex, this.targets()[0].x, this.targets()[0].y, this.targets()[0].z);
                positionAttribute.needsUpdate = true;
              },
              onComplete: () => {
                isAnimating = false;
              }
            }
          );
        }
      }
    };

    window.addEventListener("click", onClick);

    // Change cursor on hover over particles
    const onMouseMove = (event) => {
      mouse.x = (event.clientX / sizes.width) * 2 - 1;
      mouse.y = -(event.clientY / sizes.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(particles);
      
      canvasRef.current.style.cursor = intersects.length > 0 ? "pointer" : "default";
    };
    
    window.addEventListener("mousemove", onMouseMove);

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

      // Keep focused particle centered in front of camera
      if (focusedParticleIndex !== -1 && !isAnimating) {
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        const distanceFromCamera = 30;
        const targetPosition = new THREE.Vector3()
          .copy(camera.position)
          .add(cameraDirection.multiplyScalar(distanceFromCamera));
        
        const positionAttribute = particlesGeometry.getAttribute("position");
        positionAttribute.setXYZ(focusedParticleIndex, targetPosition.x, targetPosition.y, targetPosition.z);
        positionAttribute.needsUpdate = true;
      }

      // Render
      renderer.render(scene, camera);

      animationFrameId = window.requestAnimationFrame(tick);
    };

    // call tick again on the next frame
    tick();

    // Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("click", onClick);
      window.removeEventListener("mousemove", onMouseMove);
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
