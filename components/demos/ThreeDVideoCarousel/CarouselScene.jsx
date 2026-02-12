"use client";

import { useRef, useMemo, memo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import VideoPanel from "./VideoPanel";
import { config, getResponsiveConfig } from "./config";
import { calculatePanelPosition } from "./utils";

const CarouselScene = memo(function CarouselScene({
  rotationTargetRef,
  videos
}) {
  const groupRef = useRef();
  const currentRotation = useRef(0);
  const { size } = useThree();

  // Get responsive config based on viewport width
  const responsiveConfig = useMemo(() => {
    return getResponsiveConfig(size.width);
  }, [size.width]);

  // Calculate depth range for shader
  const depthConfig = useMemo(() => {
    const radius = responsiveConfig.radius;
    return {
      depthMin: 5 - radius,  // Near plane depth
      depthMax: 5 + radius   // Far plane depth (camera is at z=5)
    };
  }, [responsiveConfig.radius]);

  // Generate panel positions
  const panels = useMemo(() => {
    const panelCount = Math.min(videos.length, config.panelCount);

    return videos.slice(0, panelCount).map((video, index) => {
      const { x, y, z, rotationY } = calculatePanelPosition(index, {
        panelCount,
        cylinderRadius: responsiveConfig.radius
      });

      return {
        key: `panel-${index}`,
        position: [x, y, z],
        rotation: [0, rotationY, 0],
        scale: [responsiveConfig.panelWidth, responsiveConfig.panelHeight, 1],
        videoSrc: video.videoSrc,
        index
      };
    });
  }, [videos, responsiveConfig]);

  // Animation loop - smoothly interpolate rotation toward target
  useFrame(() => {
    if (!groupRef.current) return;

    const targetRotation = rotationTargetRef.current;

    // Smooth interpolation toward target rotation
    currentRotation.current +=
      (targetRotation - currentRotation.current) * config.smoothing;

    // Apply rotation around Y axis (vertical axis)
    groupRef.current.rotation.y = currentRotation.current;
  });

  return (
    <group ref={groupRef}>
      {panels.map((panel) => (
        <VideoPanel
          key={panel.key}
          position={panel.position}
          rotation={panel.rotation}
          scale={panel.scale}
          videoSrc={panel.videoSrc}
          index={panel.index}
          loadDelay={panel.index * 100}
          depthConfig={depthConfig}
        />
      ))}
    </group>
  );
});

export default CarouselScene;
