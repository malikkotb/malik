"use client";
import { useRef, useState, useEffect, useMemo, useCallback, memo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import projects from "@/app/carouselData";

// Vertex Shader - distorts vertices based on scroll velocity
const vertexShader = `
  varying vec2 vUv;
  uniform vec2 u_offset;
  
  #define PI 3.1415926535897932384626433832795

  vec3 deformPosition(vec3 position, vec2 uv, vec2 offset) {
    float waveX = sin(uv.y * PI);
    float waveY = sin(uv.x * PI);
    
    // Bend based on velocity - scale up for visible effect
    position.x = position.x + (waveX * offset.x);
    position.y = position.y + (waveY * offset.y * 0.5);
    
    // Subtle z-depth
    position.z = position.z + (waveX * abs(offset.x) * 0.15);
    
    return position;
  }

  void main() {
    vUv = uv;
    vec3 newPosition = deformPosition(position, uv, u_offset);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

// Fragment Shader
const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D u_texture;
  uniform vec2 u_offset;
  uniform float u_opacity;
  
  void main() {
    vec2 uv = vUv;
    uv.x += u_offset.x * 0.02 * (0.5 - abs(vUv.y - 0.5));
    
    vec4 texture = texture2D(u_texture, uv);
    gl_FragColor = vec4(texture.rgb, texture.a * u_opacity);
  }
`;

// Shared geometry - created once and reused by all carousel items
const sharedGeometry = new THREE.PlaneGeometry(1, 1, 16, 16);

// Video carousel item component - memoized to prevent unnecessary re-renders
const CarouselItem = memo(function CarouselItem({ 
  position, 
  scale, 
  videoSrc, 
  offsetRef,
  index,
  hoveredIndexRef,
  onHover,
  onLeave,
  onClick,
  link
}) {
  const meshRef = useRef();
  const materialRef = useRef();
  const videoRef = useRef(null);
  const textureRef = useRef(null);
  const currentOffset = useRef(new THREE.Vector2(0, 0));
  const currentOpacity = useRef(0.9);
  const [isReady, setIsReady] = useState(false);
  
  // Create video and texture once
  useEffect(() => {
    const video = document.createElement('video');
    video.src = videoSrc;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata'; // Only load metadata initially
    video.setAttribute('playsinline', ''); // iOS Safari
    video.setAttribute('webkit-playsinline', ''); // Older iOS
    
    videoRef.current = video;
    
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    texture.generateMipmaps = false; // Disable mipmaps for video textures
    textureRef.current = texture;
    
    // Start playing when video is ready
    const handleCanPlay = () => {
      video.play().catch(() => {});
      setIsReady(true);
    };
    
    video.addEventListener('canplaythrough', handleCanPlay, { once: true });
    video.load();
    
    return () => {
      video.removeEventListener('canplaythrough', handleCanPlay);
      video.pause();
      video.src = '';
      video.load(); // Reset video element
      texture.dispose();
      videoRef.current = null;
      textureRef.current = null;
    };
  }, [videoSrc]);
  
  // Update uniforms in animation frame - no React state updates
  useFrame(() => {
    if (!materialRef.current || !textureRef.current) return;
    
    const offset = offsetRef.current;
    
    // Smooth lerp towards target offset
    currentOffset.current.x += (offset.x - currentOffset.current.x) * 0.08;
    currentOffset.current.y += (offset.y - currentOffset.current.y) * 0.08;
    materialRef.current.uniforms.u_offset.value.copy(currentOffset.current);
    
    // Hover opacity - use ref comparison instead of prop
    const isHovered = hoveredIndexRef.current === index;
    const targetOpacity = isHovered ? 1.0 : 0.9;
    currentOpacity.current += (targetOpacity - currentOpacity.current) * 0.1;
    materialRef.current.uniforms.u_opacity.value = currentOpacity.current;
    
    // Update texture if needed
    if (textureRef.current.needsUpdate !== false) {
      materialRef.current.uniforms.u_texture.value = textureRef.current;
    }
  });

  // Stable uniforms - created once, values updated in useFrame
  const uniforms = useMemo(() => ({
    u_texture: { value: null },
    u_offset: { value: new THREE.Vector2(0, 0) },
    u_opacity: { value: 0.9 },
  }), []);

  // Set initial texture when ready
  useEffect(() => {
    if (materialRef.current && textureRef.current && isReady) {
      materialRef.current.uniforms.u_texture.value = textureRef.current;
      materialRef.current.needsUpdate = true;
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      geometry={sharedGeometry}
      onPointerEnter={(e) => { e.stopPropagation(); onHover(index); }}
      onPointerLeave={(e) => { e.stopPropagation(); onLeave(); }}
      onClick={(e) => { e.stopPropagation(); onClick(link); }}
      frustumCulled={true}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
});

// Main carousel scene with seamless infinite loop
const CarouselScene = memo(function CarouselScene({ 
  scrollStateRef,
  hoveredIndexRef,
  setHoveredIndex,
  onItemClick 
}) {
  const { viewport, size } = useThree();
  const groupRef = useRef();
  const smoothProgress = useRef(0);
  const smoothVelocity = useRef(0);
  const lastDirectionRef = useRef(0);
  
  // Offset ref for distortion - shared with all items
  const offsetRef = useRef(new THREE.Vector2(0, 0));
  
  // Convert 14px to viewport units - memoized
  const layout = useMemo(() => {
    const pxToViewport = (px) => (px / size.height) * viewport.height;
    const bottomPadding = pxToViewport(14);
    const gap = pxToViewport(14);
    const itemHeight = viewport.height - bottomPadding;
    const aspect = 16 / 10;
    const itemWidth = itemHeight * aspect;
    const yPosition = -viewport.height / 2 + itemHeight / 2 + bottomPadding;
    const totalWidth = projects.length * (itemWidth + gap);
    
    return { bottomPadding, gap, itemHeight, itemWidth, yPosition, totalWidth };
  }, [viewport.height, size.height]);
  
  // Animation loop - reads from ref, no React state updates
  useFrame(() => {
    const { scrollProgress, scrollVelocity } = scrollStateRef.current;
    
    // Smooth the scroll progress
    smoothProgress.current += (scrollProgress - smoothProgress.current) * 0.1;
    
    // Smooth the velocity for distortion
    smoothVelocity.current += (scrollVelocity - smoothVelocity.current) * 0.15;
    
    // Update offset ref (shared with all items)
    offsetRef.current.x = smoothVelocity.current * 0.75;
    offsetRef.current.y = 0;
    
    // Position the group based on scroll
    if (groupRef.current) {
      const normalizedProgress = ((smoothProgress.current % 1) + 1) % 1;
      groupRef.current.position.x = -normalizedProgress * layout.totalWidth;
    }
  });
  
  // Create items for 3 sets (before, current, after) for seamless looping
  const items = useMemo(() => {
    const { totalWidth, itemWidth, itemHeight, gap, yPosition } = layout;
    const allItems = [];
    
    // Create 3 copies: -1, 0, 1
    for (let setIndex = -1; setIndex <= 1; setIndex++) {
      projects.forEach((project, idx) => {
        const x = setIndex * totalWidth + idx * (itemWidth + gap) + itemWidth / 2;
        allItems.push({
          ...project,
          key: `${setIndex}-${idx}`,
          position: [x, yPosition, 0],
          scale: [itemWidth, itemHeight, 1],
          originalIndex: idx
        });
      });
    }
    
    return allItems;
  }, [layout]);

  return (
    <group ref={groupRef}>
      {items.map((item) => (
        <CarouselItem
          key={item.key}
          position={item.position}
          scale={item.scale}
          videoSrc={item.videoSrc}
          offsetRef={offsetRef}
          index={item.originalIndex}
          hoveredIndexRef={hoveredIndexRef}
          onHover={setHoveredIndex}
          onLeave={() => setHoveredIndex(null)}
          onClick={onItemClick}
          link={item.link}
        />
      ))}
    </group>
  );
});

// Main WebGL Carousel component
export default function WebGLCarousel() {
  const containerRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  
  // Consolidated scroll state ref - no React state updates in animation loop
  const scrollStateRef = useRef({
    scrollProgress: 0,
    scrollVelocity: 0,
    targetProgress: 0,
    lastDirection: 0
  });
  
  const lastPointerX = useRef(0);
  const dragStartProgress = useRef(0);
  const animationFrameRef = useRef(null);
  
  // Hovered index as ref to avoid re-renders, with state for cursor
  const hoveredIndexRef = useRef(null);
  const [, forceUpdate] = useState(0); // Only for cursor change
  
  const setHoveredIndex = useCallback((index) => {
    hoveredIndexRef.current = index;
  }, []);
  
  // Main animation loop - uses refs only, no React state updates
  useEffect(() => {
    const animate = () => {
      const state = scrollStateRef.current;
      const progressDiff = state.targetProgress - state.scrollProgress;
      
      // Detect direction change for more responsive animation
      const currentDirection = Math.sign(progressDiff);
      const directionChanged = currentDirection !== 0 && state.lastDirection !== 0 && 
                               currentDirection !== state.lastDirection;
      
      // Use higher smoothing factor when direction changes
      const smoothingFactor = directionChanged ? 0.15 : 0.08;
      state.scrollProgress += progressDiff * smoothingFactor;
      state.lastDirection = currentDirection;
      
      // Calculate velocity from progress change (clamped to -0.1 to 0.1)
      const rawVelocity = progressDiff * 2;
      state.scrollVelocity = Math.max(-0.1, Math.min(0.1, rawVelocity));
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Pointer handlers for drag - stable callbacks
  const handlePointerDown = useCallback((e) => {
    setIsDragging(true);
    lastPointerX.current = e.clientX;
    dragStartProgress.current = scrollStateRef.current.targetProgress;
  }, []);
  
  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastPointerX.current;
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    
    // Convert pixel movement to progress
    const progressDelta = -deltaX / containerWidth * 0.5;
    scrollStateRef.current.targetProgress += progressDelta;
    
    lastPointerX.current = e.clientX;
  }, [isDragging]);
  
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Wheel handler - passive: false for preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * 0.0003;
      scrollStateRef.current.targetProgress += delta;
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);
  
  // Item click handler
  const handleItemClick = useCallback((link) => {
    if (!isDragging && link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  }, [isDragging]);

  // Memoized canvas props for stable reference
  const cameraProps = useMemo(() => ({ 
    position: [0, 0, 5], 
    fov: 50, 
    near: 0.1, 
    far: 100 
  }), []);
  
  const glProps = useMemo(() => ({ 
    antialias: true, 
    alpha: true, 
    powerPreference: 'high-performance',
    stencil: false,
    depth: false
  }), []);

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-0 left-0 w-full overflow-hidden"
      style={{ 
        height: '65vh',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Canvas
        camera={cameraProps}
        gl={glProps}
        style={{ background: 'transparent' }}
        frameloop="always"
        dpr={[1, 2]}
      >
        <CarouselScene
          scrollStateRef={scrollStateRef}
          hoveredIndexRef={hoveredIndexRef}
          setHoveredIndex={setHoveredIndex}
          onItemClick={handleItemClick}
        />
      </Canvas>
    </div>
  );
}
