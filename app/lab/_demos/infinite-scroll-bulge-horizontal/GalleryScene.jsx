'use client';

import { memo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import GalleryMesh from './GalleryMesh';
import { HorizontalMotionBlur, HorizontalGaussianBlur } from './HorizontalBlurEffect';

function VelocityMotionBlur({ velocityRef, intensity, style }) {
  const smearRef = useRef();
  const gaussianRef = useRef();
  const { size } = useThree();

  useFrame(() => {
    const blurAmount = velocityRef.current * intensity;

    if (style === 'smear' && smearRef.current) {
      smearRef.current.intensity = blurAmount;
    } else if (style === 'gaussian' && gaussianRef.current) {
      gaussianRef.current.intensity = blurAmount;
      gaussianRef.current.setResolution(size.width, size.height);
    }
  });

  if (style === 'gaussian') {
    return (
      <HorizontalGaussianBlur
        ref={gaussianRef}
        intensity={0}
        resolution={[size.width, size.height]}
      />
    );
  }

  return <HorizontalMotionBlur ref={smearRef} intensity={0} samples={12} />;
}

const GalleryScene = memo(function GalleryScene({ scrollState, config }) {
  const velocityRef = useRef(0);

  const handleVelocityChange = (v) => {
    velocityRef.current = v;
  };

  return (
    <>
      <GalleryMesh
        scrollState={scrollState}
        config={config}
        onVelocityChange={handleVelocityChange}
      />
      <EffectComposer disableNormalPass multisampling={0}>
        <VelocityMotionBlur
          velocityRef={velocityRef}
          intensity={config.motionBlurIntensity}
          style={config.motionBlurStyle}
        />
      </EffectComposer>
    </>
  );
});

export default GalleryScene;
