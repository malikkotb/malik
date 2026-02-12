"use client";

import { useRef, useEffect, useMemo, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { config } from "./config";

// Import shaders as strings
const vertexShader = `
varying vec2 vUv;
varying float vDepth;

void main() {
  vUv = uv;

  // Calculate world position for depth
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * worldPosition;

  // Normalize depth - negative because camera looks down -Z
  vDepth = -viewPosition.z;

  gl_Position = projectionMatrix * viewPosition;
}
`;

const fragmentShader = `
varying vec2 vUv;
varying float vDepth;

uniform sampler2D u_texture;
uniform float u_depthMin;
uniform float u_depthMax;
uniform float u_desaturation;
uniform float u_darkening;
uniform float u_opacityReduction;

void main() {
  vec4 texColor = texture2D(u_texture, vUv);

  // Calculate normalized depth factor (0 = near, 1 = far)
  float depthFactor = smoothstep(u_depthMin, u_depthMax, vDepth);

  // Apply desaturation to distant panels
  float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
  vec3 desaturated = mix(texColor.rgb, vec3(gray), depthFactor * u_desaturation);

  // Apply darkening to distant panels
  vec3 darkened = desaturated * (1.0 - depthFactor * u_darkening);

  // Apply opacity reduction to distant panels
  float opacity = texColor.a * (1.0 - depthFactor * u_opacityReduction);

  gl_FragColor = vec4(darkened, opacity);
}
`;

// Create a curved panel geometry that matches cylinder curvature
// panelWidth: actual width of panel in world units
// cylinderRadius: radius of the cylinder the panel wraps around
function createCurvedPanelGeometry(panelWidth, cylinderRadius, segmentsX = 32, segmentsY = 1) {
  const geometry = new THREE.PlaneGeometry(1, 1, segmentsX, segmentsY);
  const position = geometry.attributes.position;

  // Calculate the arc angle that this panel spans on the cylinder
  const arcAngle = panelWidth / cylinderRadius;

  // Calculate max depth at edges for offset calculation
  const halfArcAngle = arcAngle / 2;
  const maxDepth = cylinderRadius * (1 - Math.cos(halfArcAngle));

  // For each vertex, calculate its position on the cylinder surface
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i); // -0.5 to 0.5 for a 1-unit wide plane

    // Map x position to angle on the cylinder arc
    const angle = x * arcAngle;

    // Calculate Z offset to match cylinder curvature
    // Center (angle=0) should bulge forward (positive Z)
    // Edges should be at z=0
    const depth = cylinderRadius * (1 - Math.cos(angle));
    const z = maxDepth - depth;

    position.setZ(i, z);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}

// Shared curved geometry - matches cylinder radius of 3.5 with panel width of 1.6
const sharedGeometry = createCurvedPanelGeometry(
  config.panelWidth,
  config.cylinderRadius,
  32,
  1
);

// Default placeholder texture
const defaultPlaceholderCanvas = typeof document !== "undefined"
  ? (() => {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#e5e5e5";
      ctx.fillRect(0, 0, 16, 16);
      return canvas;
    })()
  : null;

const defaultPlaceholderTexture = defaultPlaceholderCanvas
  ? new THREE.CanvasTexture(defaultPlaceholderCanvas)
  : null;

const VideoPanel = memo(function VideoPanel({
  position,
  rotation,
  scale,
  videoSrc,
  index,
  loadDelay = 0,
  depthConfig
}) {
  const meshRef = useRef();
  const materialRef = useRef();
  const videoRef = useRef(null);
  const textureRef = useRef(null);

  // Create video element and VideoTexture with staggered loading
  useEffect(() => {
    let mounted = true;
    let video = null;
    let texture = null;
    let loadTimeout = null;

    const initVideo = () => {
      if (!mounted) return;

      video = document.createElement("video");
      video.src = videoSrc;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");

      videoRef.current = video;

      texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBAFormat;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;
      textureRef.current = texture;

      // When video is ready, update material and play
      const handleCanPlay = () => {
        if (!mounted) return;

        // Update material texture
        if (materialRef.current) {
          materialRef.current.uniforms.u_texture.value = texture;
        }

        // Start playing
        video.play().catch(() => {
          // Autoplay blocked - video will stay paused
        });
      };

      video.addEventListener("canplay", handleCanPlay, { once: true });
      video.load();
    };

    // Stagger video loading to avoid network congestion
    loadTimeout = setTimeout(initVideo, loadDelay);

    return () => {
      mounted = false;
      if (loadTimeout) clearTimeout(loadTimeout);
      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
      if (texture) texture.dispose();
      videoRef.current = null;
      textureRef.current = null;
    };
  }, [videoSrc, loadDelay]);

  // Uniforms for shader material
  const uniforms = useMemo(
    () => ({
      u_texture: { value: defaultPlaceholderTexture },
      u_depthMin: { value: depthConfig?.depthMin ?? 2 },
      u_depthMax: { value: depthConfig?.depthMax ?? 8 },
      u_desaturation: { value: config.depthEffect.desaturation },
      u_darkening: { value: config.depthEffect.darkening },
      u_opacityReduction: { value: config.depthEffect.opacityReduction }
    }),
    [depthConfig]
  );

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      geometry={sharedGeometry}
      frustumCulled={true}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
});

export default VideoPanel;
