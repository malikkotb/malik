'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import PageMesh from './PageMesh';
import ShadowMesh from './ShadowMesh';
import { config } from './config';
import pages from './data';

export default function MagazineScene({ flipState }) {
  const [flipProgress, setFlipProgress] = useState(0);
  const [peekProgress, setPeekProgress] = useState(0);
  const [currentSpread, setCurrentSpread] = useState(0);

  // Track bounce state
  const bounceRef = useRef({
    hasOvershot: false,
    settlingBounces: 0,
  });

  // Animation loop
  useFrame((state, delta) => {
    if (!flipState.current) return;

    const fState = flipState.current;
    const bounce = bounceRef.current;

    // Clamp delta to prevent large jumps
    const clampedDelta = Math.min(delta, 0.05);

    // Animate peek progress (smooth transition)
    if (!fState.isDragging) {
      const peekDiff = fState.targetPeekProgress - fState.peekProgress;
      // Faster easing for peek animation
      fState.peekProgress += peekDiff * 8.0 * clampedDelta;

      // Snap to target when close
      if (Math.abs(peekDiff) < 0.001) {
        fState.peekProgress = fState.targetPeekProgress;
      }
    }

    // Update flip animation
    if (!fState.isDragging) {
      const diff = fState.targetProgress - fState.flipProgress;

      // Spring physics with bounce
      fState.velocity += diff * config.springStiffness * clampedDelta;
      fState.velocity *= config.springDamping;
      fState.flipProgress += fState.velocity;

      // Bounce detection when approaching target of 1.0
      if (fState.targetProgress === 1.0) {
        // Detect overshoot
        if (fState.flipProgress > 1.0 && !bounce.hasOvershot) {
          bounce.hasOvershot = true;
          bounce.settlingBounces = 0;
        }

        // Apply bounce when overshooting
        if (fState.flipProgress > 1.0 + config.bounceStrength) {
          // Reverse velocity and apply bounce damping
          fState.velocity *= -config.bounceDamping;
          fState.flipProgress = 1.0 + config.bounceStrength;
          bounce.settlingBounces++;
        }

        // Check if flip completed (after bouncing settles)
        if (fState.flipProgress > 0.98 && fState.flipProgress < 1.02 &&
            Math.abs(fState.velocity) < 0.02) {
          if (fState.currentSpread < config.totalSpreads - 1) {
            fState.currentSpread += 1;
            fState.flipProgress = 0;
            fState.targetProgress = 0;
            fState.velocity = 0;
            bounce.hasOvershot = false;
            bounce.settlingBounces = 0;
          } else {
            fState.flipProgress = 1;
            fState.velocity = 0;
          }
        }
      }

      // Check if spring back completed
      if (fState.targetProgress === 0.0 &&
          Math.abs(fState.flipProgress) < 0.01 &&
          Math.abs(fState.velocity) < 0.01) {
        fState.flipProgress = 0;
        fState.velocity = 0;
        bounce.hasOvershot = false;
      }
    }

    // Update React state for re-renders
    setFlipProgress(Math.max(0, Math.min(1.1, fState.flipProgress)));
    setPeekProgress(fState.peekProgress);
    setCurrentSpread(fState.currentSpread);
  });

  // Get current page data
  const currentPage = pages[currentSpread];
  const nextPage = pages[currentSpread + 1];

  // Calculate positions
  const leftPageX = -config.pageWidth / 2 - 0.01;
  const rightPageX = config.pageWidth / 2 + 0.01;

  // Calculate reveal amount for underlying page
  const totalLift = flipProgress + peekProgress;
  const nextPageOpacity = Math.min(1, totalLift * 2); // Reveal faster
  const nextPageZ = -0.01 - (1 - totalLift) * 0.005; // Move slightly forward as page lifts

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />

      {/* Left page (static - shows back of previous page or cover) */}
      <PageMesh
        frontTexturePath={currentSpread > 0 ? pages[currentSpread - 1].back : currentPage.front}
        backTexturePath={currentPage.front}
        flipProgress={0}
        peekProgress={0}
        position={[leftPageX, 0, 0]}
      />

      {/* Shadow on left page during flip */}
      <ShadowMesh
        flipProgress={flipProgress}
        peekProgress={peekProgress}
        position={[leftPageX, 0, 0.001]}
      />

      {/* Next page underneath (revealed during flip) - render before current page */}
      {nextPage && (
        <group>
          <PageMesh
            frontTexturePath={nextPage.front}
            backTexturePath={nextPage.back}
            flipProgress={0}
            peekProgress={0}
            position={[rightPageX, 0, nextPageZ]}
          />
          {/* Darkening overlay on underlying page */}
          <mesh position={[rightPageX, 0, nextPageZ + 0.001]}>
            <planeGeometry args={[config.pageWidth, config.pageHeight]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={Math.max(0, 0.15 - totalLift * 0.15)}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* Right page (flipping page) */}
      <PageMesh
        frontTexturePath={currentPage.front}
        backTexturePath={currentPage.back}
        flipProgress={flipProgress}
        peekProgress={peekProgress}
        position={[rightPageX, 0, 0]}
      />

      {/* Page indicator dots */}
      <group position={[0, -config.pageHeight / 2 - 0.3, 0]}>
        {pages.map((_, index) => (
          <mesh key={index} position={[(index - (pages.length - 1) / 2) * 0.15, 0, 0]}>
            <circleGeometry args={[0.03, 16]} />
            <meshBasicMaterial
              color={index === currentSpread ? '#333' : '#ccc'}
              transparent
              opacity={index === currentSpread ? 1 : 0.5}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}
