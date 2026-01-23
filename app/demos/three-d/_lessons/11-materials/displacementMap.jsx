"use client";
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function DisplacementPlane() {
  const mountRef = useRef();

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      100
    );
    camera.position.z = 3;

    // Add lights
    const pointLight = new THREE.PointLight(0xffffff, 2.5);
    pointLight.position.set(2, 2, 1);
    scene.add(pointLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Mouse tracking
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Material with displacement map
    const displacementTexture = new THREE.TextureLoader().load(
      "/demos/textures/door/height.avif"
    );
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uDisplacement: { value: displacementTexture },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uStrength: { value: 1 }, // change this alue
        uColor: { value: new THREE.Color(0xce21ce) },
      },
      vertexShader: `
        uniform sampler2D uDisplacement;
        uniform vec2 uMouse;
        uniform float uStrength;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vec3 pos = position;
          float disp = texture2D(uDisplacement, uv).r;
          float dist = distance(uv, uMouse);
          pos.z += disp * uStrength * (1.0 - dist);
          
          // Calculate normals
          vec3 tangent = normalize(vec3(1.0, 0.0, 
            texture2D(uDisplacement, vec2(uv.x + 0.01, uv.y)).r * uStrength -
            texture2D(uDisplacement, vec2(uv.x - 0.01, uv.y)).r * uStrength
          ));
          vec3 bitangent = normalize(vec3(0.0, 1.0,
            texture2D(uDisplacement, vec2(uv.x, uv.y + 0.01)).r * uStrength -
            texture2D(uDisplacement, vec2(uv.x, uv.y - 0.01)).r * uStrength
          ));
          vNormal = normalize(cross(tangent, bitangent));
          
          vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
          vPosition = modelPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * modelPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 lightPos = vec3(2.0, 2.0, 1.0);
          vec3 lightDir = normalize(lightPos - vPosition);
          
          // Ambient
          float ambientStrength = 0.2;
          vec3 ambient = ambientStrength * uColor;
          
          // Diffuse
          float diff = max(dot(vNormal, lightDir), 0.0);
          vec3 diffuse = diff * uColor * 1.5;
          
          // Specular
          float specularStrength = 1.0;
          vec3 viewDir = normalize(cameraPosition - vPosition);
          vec3 reflectDir = reflect(-lightDir, vNormal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
          vec3 specular = specularStrength * spec * vec3(1.0);
          
          // Final color
          vec3 result = ambient + diffuse + specular;
          gl_FragColor = vec4(result, 1.0);
        }
      `,
    });

    // Plane geometry
    const geometry = new THREE.PlaneGeometry(2, 2, 128, 128);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      material.uniforms.uMouse.value.set(mouse.x, 1 - mouse.y); // flip Y for UV
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      mountRef.current.removeChild(renderer.domElement);
      controls.dispose();
      geometry.dispose();
      material.dispose();
      displacementTexture.dispose();
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />
  );
}
