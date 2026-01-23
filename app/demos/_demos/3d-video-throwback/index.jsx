"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import GUI from "lil-gui";
import { Timer } from "three/src/core/Timer.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shaders/test/vertex.glsl";
import fragmentShader from "./shaders/test/fragment.glsl";

export default function Shaders() {
  const canvasRef = useRef(null);

  // TODO: IMPORTANT
  // we can send a value from the vertext to the fragment shader.
  // those are called **varyings** and the value gets interpolated between the vertices.

  // for custom shaders u can use
  // ShaderMaterial or RawShaderMaterial
  // ShaderMaterial will have some code automatically added to the shader codes
  // RawShaderMaterial will have nothing

  useEffect(() => {
    if (!canvasRef.current) return;

    // Debug UI
    const gui = new GUI({ width: 230, title: "Debug UI" });
    // Position GUI at top, 100px from top
    gui.domElement.style.position = 'fixed';
    gui.domElement.style.top = '100px';
    gui.domElement.style.right = '0';
    gui.domElement.style.zIndex = '1000';
    gui.hide();


    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");

    /**
     * Video Texture
     */
    // Create video element
    const video = document.createElement("video");
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.crossOrigin = "anonymous";
    video.preload = "auto";
    video.style.display = "none";
    // Add video to DOM (required for some browsers)
    document.body.appendChild(video);

    // Load video and wait for it to be ready
    const loadVideo = () => {
      const videoUrl = "https://malik-portfolio.b-cdn.net/reel.mp4";
      
      const tryPlay = () => {
        video.play()
          .then(() => {
            console.log("Video playing successfully");
            // Switch to video texture once video is ready
            texture = videoTexture;
            if (material) {
              material.uniforms.uTexture.value = videoTexture;
            }
            videoTexture.needsUpdate = true;
          })
          .catch((error) => {
            console.error("Error playing video:", error);
            // Try again after a short delay (sometimes needed for autoplay policies)
            setTimeout(() => {
              video.play()
                .then(() => {
                  texture = videoTexture;
                  if (material) {
                    material.uniforms.uTexture.value = videoTexture;
                  }
                  videoTexture.needsUpdate = true;
                })
                .catch((err) => {
                  console.error("Second play attempt failed:", err);
                });
            }, 100);
          });
      };

      const onCanPlay = () => {
        console.log("Video can play");
        if (video.readyState >= 2) {
          tryPlay();
        }
      };

      const onCanPlayThrough = () => {
        console.log("Video can play through");
        tryPlay();
      };

      const onLoadedData = () => {
        console.log("Video data loaded, readyState:", video.readyState);
        if (video.readyState >= 3) {
          tryPlay();
        }
      };

      const onError = (error) => {
        console.error("Error loading video:", error, video.error);
      };

      video.addEventListener("canplay", onCanPlay);
      video.addEventListener("canplaythrough", onCanPlayThrough);
      video.addEventListener("loadeddata", onLoadedData);
      video.addEventListener("error", onError);

      // Set video source
      video.src = videoUrl;
      video.load();
    };

    // Create a placeholder texture first
    const placeholderCanvas = document.createElement("canvas");
    placeholderCanvas.width = 1;
    placeholderCanvas.height = 1;
    const placeholderTexture = new THREE.CanvasTexture(placeholderCanvas);
    
    // Create video texture (will be used after video loads)
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;
    
    // Start with placeholder, will be replaced when video loads
    let texture = placeholderTexture;

    /**
     * Test mesh
     */
    // Geometry
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

    // we can add random values for each vertex and move that vertex on the z axis according to that value
    const count = geometry.attributes.position.count;
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      randoms[i] = Math.random();
    }

    geometry.setAttribute(
      "aRandom",
      new THREE.BufferAttribute(randoms, 1)
    );

    console.log(geometry);

    // Material // RawShaderMaterial
    const material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      // some other three.js properties still work:
      side: THREE.DoubleSide,
      // wireframe: true,
      transparent: true, // for alpha to work
      // many won't work, like:
      // map, alphaMap, opacity, color etc.
      uniforms: {
        uFrequency: { value: new THREE.Vector2(10, 5) },
        uTime: { value: 0 },
        uTexture: { value: texture },
        uWaveIntensity: { value: 0.1 },
        // uColor: { value: new THREE.Color(0x00ff00) },
      },
    });

    gui
      .add(material.uniforms.uFrequency.value, "x")
      .min(0)
      .max(20)
      .step(0.01)
      .name("frequencyX");
    gui
      .add(material.uniforms.uFrequency.value, "y")
      .min(0)
      .max(20)
      .step(0.01)
      .name("frequencyY");
    gui
      .add(material.uniforms.uWaveIntensity, "value")
      .min(0)
      .max(1)
      .step(0.01)
      .name("waveIntensity");

    // Animation controls
    const animationControls = {
      paused: false,
      speed: 1.0,
    };
    
    const animationFolder = gui.addFolder("Animation");
    animationFolder
      .add(animationControls, "paused")
      .name("Pause");
    animationFolder
      .add(animationControls, "speed")
      .min(0)
      .max(5)
      .step(0.1)
      .name("Speed");


    // ShaderMaterial
    // same as RawShaderMaterial but with pre-built uniforms, attributes
    // and prcisons prepended to the shader codes

    // Mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(1, 2/3, 1);
    scene.add(mesh);

    // Mesh controls
    const meshControls = {
      scaleX: 1,
      scaleY: 2/3,
      scaleZ: 1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      positionX: 0,
      positionY: 0,
      positionZ: 0,
    };

    const meshFolder = gui.addFolder("Mesh");
    meshFolder
      .add(meshControls, "scaleX")
      .min(0.1)
      .max(5)
      .step(0.1)
      .name("Scale X")
      .onChange((value) => {
        mesh.scale.x = value;
      });
    meshFolder
      .add(meshControls, "scaleY")
      .min(0.1)
      .max(5)
      .step(0.1)
      .name("Scale Y")
      .onChange((value) => {
        mesh.scale.y = value;
      });
    meshFolder
      .add(meshControls, "scaleZ")
      .min(0.1)
      .max(5)
      .step(0.1)
      .name("Scale Z")
      .onChange((value) => {
        mesh.scale.z = value;
      });
    meshFolder
      .add(meshControls, "rotationX")
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.01)
      .name("Rotation X")
      .onChange((value) => {
        mesh.rotation.x = value;
      });
    meshFolder
      .add(meshControls, "rotationY")
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.01)
      .name("Rotation Y")
      .onChange((value) => {
        mesh.rotation.y = value;
      });
    meshFolder
      .add(meshControls, "rotationZ")
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.01)
      .name("Rotation Z")
      .onChange((value) => {
        mesh.rotation.z = value;
      });
    meshFolder
      .add(meshControls, "positionX")
      .min(-5)
      .max(5)
      .step(0.1)
      .name("Position X")
      .onChange((value) => {
        mesh.position.x = value;
      });
    meshFolder
      .add(meshControls, "positionY")
      .min(-5)
      .max(5)
      .step(0.1)
      .name("Position Y")
      .onChange((value) => {
        mesh.position.y = value;
      });
    meshFolder
      .add(meshControls, "positionZ")
      .min(-5)
      .max(5)
      .step(0.1)
      .name("Position Z")
      .onChange((value) => {
        mesh.position.z = value;
      });

    // Load video
    loadVideo();

    /**
     * Snowflake Particles
     */
    const particleCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    // Initialize particles with random positions and velocities
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random positions in a larger area
      particlePositions[i3] = (Math.random() - 0.5) * 20;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 20;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 10;
      
      // Random velocities (flowing downward with slight horizontal drift)
      particleVelocities[i3] = (Math.random() - 0.5) * 0.01; // Small horizontal X movement
      particleVelocities[i3 + 1] = -(Math.random() * 0.03 + 0.01); // Always downward (negative Y)
      particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.005; // Small depth movement
      
      // Random sizes
      particleSizes[i] = Math.random() * 0.05 + 0.02;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    // Create circular texture for particles
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 128;
    particleCanvas.height = 128;
    const particleContext = particleCanvas.getContext('2d');
    
    // Draw white circle with smooth edges
    const gradient = particleContext.createRadialGradient(64, 64, 0, 64, 64, 60);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.8, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    particleContext.fillStyle = gradient;
    particleContext.beginPath();
    particleContext.arc(64, 64, 60, 0, Math.PI * 2);
    particleContext.fill();
    
    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    // Create particle material with white circles
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      map: particleTexture,
      alphaTest: 0.001,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particleSystem);

    /**
     * Lights
     */
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
    scene.add(ambientLight);

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

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
    camera.position.set(0.25, -0.25, 1);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;

    // Camera controls
    const cameraControls = {
      positionX: camera.position.x,
      positionY: camera.position.y,
      positionZ: camera.position.z,
      fov: 75,
    };

    const cameraFolder = gui.addFolder("Camera");
    cameraFolder
      .add(cameraControls, "positionX")
      .min(-10)
      .max(10)
      .step(0.1)
      .name("Position X")
      .onChange((value) => {
        camera.position.x = value;
      });
    cameraFolder
      .add(cameraControls, "positionY")
      .min(-10)
      .max(10)
      .step(0.1)
      .name("Position Y")
      .onChange((value) => {
        camera.position.y = value;
      });
    cameraFolder
      .add(cameraControls, "positionZ")
      .min(0.1)
      .max(10)
      .step(0.1)
      .name("Position Z")
      .onChange((value) => {
        camera.position.z = value;
      });
    cameraFolder
      .add(cameraControls, "fov")
      .min(10)
      .max(120)
      .step(1)
      .name("Field of View")
      .onChange((value) => {
        camera.fov = value;
        camera.updateProjectionMatrix();
      });

    // Scene controls
    const sceneControls = {
      backgroundColor: "#000000",
      wireframe: false,
      opacity: 1.0,
    };

    const sceneFolder = gui.addFolder("Scene");
    sceneFolder
      .addColor(sceneControls, "backgroundColor")
      .name("Background")
      .onChange((value) => {
        scene.background = new THREE.Color(value);
      });
    sceneFolder
      .add(sceneControls, "wireframe")
      .name("Wireframe")
      .onChange((value) => {
        material.wireframe = value;
      });
    sceneFolder
      .add(sceneControls, "opacity")
      .min(0)
      .max(1)
      .step(0.01)
      .name("Opacity")
      .onChange((value) => {
        material.opacity = value;
      });

    // Light controls
    const lightControls = {
      intensity: 2.1,
    };

    const lightFolder = gui.addFolder("Lighting");
    lightFolder
      .add(lightControls, "intensity")
      .min(0)
      .max(10)
      .step(0.1)
      .name("Ambient Intensity")
      .onChange((value) => {
        ambientLight.intensity = value;
      });

    // Video controls
    const videoControls = {
      playbackRate: 1.0,
      loop: true,
    };

    const videoFolder = gui.addFolder("Video");
    videoFolder
      .add(videoControls, "playbackRate")
      .min(0)
      .max(3)
      .step(0.1)
      .name("Playback Speed")
      .onChange((value) => {
        video.playbackRate = value;
      });
    videoFolder
      .add(videoControls, "loop")
      .name("Loop")
      .onChange((value) => {
        video.loop = value;
      });

    // Particle controls
    const particleControls = {
      enabled: true,
      speed: 0.5,
      opacity: 0.8,
      size: 0.1,
    };

    const particleFolder = gui.addFolder("Particles");
    particleFolder
      .add(particleControls, "enabled")
      .name("Enabled")
      .onChange((value) => {
        particleSystem.visible = value;
      });
    particleFolder
      .add(particleControls, "speed")
      .min(0)
      .max(5)
      .step(0.1)
      .name("Speed");
    particleFolder
      .add(particleControls, "opacity")
      .min(0)
      .max(1)
      .step(0.01)
      .name("Opacity")
      .onChange((value) => {
        particleMaterial.opacity = value;
      });
    particleFolder
      .add(particleControls, "size")
      .min(0.01)
      .max(0.5)
      .step(0.01)
      .name("Size")
      .onChange((value) => {
        particleMaterial.size = value;
      });

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    let animationFrameId;

    const clock = new THREE.Clock();
    let animationTime = 0;
    let lastFrameTime = 0;

    const tick = () => {
      const currentTime = clock.getElapsedTime();
      const deltaTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;

      // Update animation time only when not paused
      if (!animationControls.paused) {
        animationTime += deltaTime * animationControls.speed;
      }

      // Update time uniform for animation
      material.uniforms.uTime.value = animationTime;

      // Update video texture (only if it's the video texture, not placeholder)
      if (texture === videoTexture && video.readyState >= 2) {
        texture.needsUpdate = true;
      }

      // Update particle positions (snowflakes)
      if (!animationControls.paused && particleControls.enabled) {
        const positions = particlesGeometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          
          // Update position based on velocity with speed multiplier
          positions[i3] += particleVelocities[i3] * particleControls.speed;
          positions[i3 + 1] += particleVelocities[i3 + 1] * particleControls.speed;
          positions[i3 + 2] += particleVelocities[i3 + 2] * particleControls.speed;
          
          // Wrap around if particles go out of bounds
          if (Math.abs(positions[i3]) > 10) {
            positions[i3] = (Math.random() - 0.5) * 20;
          }
          // Reset to top when particle falls below bottom
          if (positions[i3 + 1] < -10) {
            positions[i3 + 1] = 10; // Reset to top
            positions[i3] = (Math.random() - 0.5) * 20; // Randomize X position
            positions[i3 + 2] = (Math.random() - 0.5) * 10; // Randomize Z position
          }
          if (Math.abs(positions[i3 + 2]) > 5) {
            positions[i3 + 2] = (Math.random() - 0.5) * 10;
          }
        }
        particlesGeometry.attributes.position.needsUpdate = true;
      }

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
      if (video) {
        video.pause();
        video.src = "";
        // Remove video from DOM
        if (video.parentNode) {
          video.parentNode.removeChild(video);
        }
      }
      if (texture) texture.dispose();
      if (placeholderTexture) placeholderTexture.dispose();
      if (videoTexture) videoTexture.dispose();
      if (particlesGeometry) particlesGeometry.dispose();
      if (particleMaterial) particleMaterial.dispose();
      if (particleTexture) particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className=''>
      <canvas
        ref={canvasRef}
        className='fixed top-0 left-0 w-full h-full outline-none'
      />
    </div>
  );
}
