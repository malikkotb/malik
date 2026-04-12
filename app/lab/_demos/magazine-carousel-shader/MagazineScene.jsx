'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PageMesh from './PageMesh';
import ShadowMesh from './ShadowMesh';
import { config } from './config';
import pages from './data';

// Page thickness strip — thin box along an edge
function ThicknessStrip({ position, width, height, depth, color = '#e8e4de' }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, depth]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// Stacked page thickness at the fore-edge of each page stack
function PageStack({ side, spreadIndex, totalSpreads }) {
  const pagesRemaining = side === 'right'
    ? totalSpreads - spreadIndex
    : spreadIndex;

  if (pagesRemaining <= 0) return null;

  const stackDepth = Math.min(pagesRemaining * config.pageThickness * 4, 0.06);
  const hw = config.pageWidth / 2;
  const hh = config.pageHeight / 2;
  // Pages are centered at ±hw in world space, so outer fore-edge is at ±(hw + hw) = ±pageWidth
  const foreEdgeX = side === 'right' ? config.pageWidth + 0.001 : -(config.pageWidth + 0.001);
  // Top/bottom strips centered at the page center (±hw) in world space
  const pageCenterX = side === 'right' ? hw : -hw;
  const color = '#ddd8d0';

  return (
    <group>
      {/* Fore-edge (outer edge of page) */}
      <ThicknessStrip
        position={[foreEdgeX, 0, -stackDepth / 2]}
        width={0.004}
        height={config.pageHeight}
        depth={stackDepth}
        color={color}
      />
      {/* Top edge */}
      <ThicknessStrip
        position={[pageCenterX, hh + 0.001, -stackDepth / 2]}
        width={config.pageWidth}
        height={0.004}
        depth={stackDepth}
        color={color}
      />
      {/* Bottom edge */}
      <ThicknessStrip
        position={[pageCenterX, -hh - 0.001, -stackDepth / 2]}
        width={config.pageWidth}
        height={0.004}
        depth={stackDepth}
        color={color}
      />
    </group>
  );
}

export default function MagazineScene({ flipState, paramsRef }) {
  const [flipProgress, setFlipProgress] = useState(0);
  const [peekProgress, setPeekProgress] = useState(0);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [flipDir, setFlipDir] = useState(1); // +1 forward, -1 backward

  const bounceRef = useRef({ hasOvershot: false });

  // Preload all textures upfront so spread transitions never have an async texture swap.
  // A state counter forces a re-render when the first textures arrive so pages show immediately.
  const textures = useRef({});
  const [textureVersion, setTextureVersion] = useState(0);

  const placeholder = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 2; canvas.height = 2;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0ede8';
    ctx.fillRect(0, 0, 2, 2);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const paths = [...new Set(pages.flatMap(p => [p.front, p.back]))];
    let firstLoaded = false;
    paths.forEach(path => {
      loader.load(path, (t) => {
        t.minFilter = THREE.LinearFilter;
        t.magFilter = THREE.LinearFilter;
        textures.current[path] = t;
        // Trigger one re-render as soon as the first texture lands so pages appear immediately
        if (!firstLoaded) {
          firstLoaded = true;
          setTextureVersion(v => v + 1);
        }
      });
    });
  }, []);

  const tex = (path) => (path && textures.current[path]) ?? placeholder;

  useFrame((state, delta) => {
    if (!flipState.current) return;

    const fState = flipState.current;
    const bounce = bounceRef.current;
    const clampedDelta = Math.min(delta, 0.05);

    // Animate peek
    if (!fState.isDragging) {
      const peekDiff = fState.targetPeekProgress - fState.peekProgress;
      fState.peekProgress += peekDiff * 8.0 * clampedDelta;
      if (Math.abs(peekDiff) < 0.001) fState.peekProgress = fState.targetPeekProgress;
    }

    // Spring physics for flip
    if (!fState.isDragging) {
      const diff = fState.targetProgress - fState.flipProgress;
      fState.velocity += diff * config.springStiffness * clampedDelta;
      fState.velocity *= config.springDamping;
      fState.flipProgress += fState.velocity;

      if (fState.targetProgress === 1.0) {
        if (fState.flipProgress > 1.0 + config.bounceStrength) {
          fState.velocity *= -config.bounceDamping;
          fState.flipProgress = 1.0 + config.bounceStrength;
          bounce.hasOvershot = true;
        }

        if (
          fState.flipProgress > 0.98 &&
          fState.flipProgress < 1.02 &&
          Math.abs(fState.velocity) < 0.02
        ) {
          const dir = fState.flipDir ?? 1;
          if (dir === 1 && fState.currentSpread < config.totalSpreads - 1) {
            fState.currentSpread += 1;
            fState.flipProgress = 0;
            fState.targetProgress = 0;
            fState.velocity = 0;
            bounce.hasOvershot = false;
          } else if (dir === -1 && fState.currentSpread > 0) {
            fState.currentSpread -= 1;
            fState.flipProgress = 0;
            fState.targetProgress = 0;
            fState.velocity = 0;
            bounce.hasOvershot = false;
          } else {
            fState.flipProgress = 1;
            fState.velocity = 0;
          }
        }
      }

      if (
        fState.targetProgress === 0.0 &&
        Math.abs(fState.flipProgress) < 0.01 &&
        Math.abs(fState.velocity) < 0.01
      ) {
        fState.flipProgress = 0;
        fState.velocity = 0;
        fState.flipDir = 1; // reset to forward default
      }
    }

    // Resolve curl radius from params
    if (paramsRef?.current) {
      const p = paramsRef.current;
      const fp = Math.max(0, Math.min(1, fState.flipProgress + fState.peekProgress));
      if (p.curlMode === 'tight') {
        p.resolvedCurlRadius = p.curlRadiusTight;
      } else if (p.curlMode === 'loose') {
        p.resolvedCurlRadius = p.curlRadiusLoose;
      } else {
        // Dynamic: starts tight, loosens as page opens
        p.resolvedCurlRadius = THREE.MathUtils.lerp(p.curlRadiusTight, p.curlRadiusLoose, fp);
      }
    }

    setFlipProgress(Math.max(0, Math.min(1.1, fState.flipProgress)));
    setPeekProgress(fState.peekProgress);
    setCurrentSpread(fState.currentSpread);
    setFlipDir(fState.flipDir ?? 1);
  });

  const currentPage = pages[currentSpread];
  const nextPage = pages[currentSpread + 1];
  const prevPage = currentSpread > 0 ? pages[currentSpread - 1] : null;

  const curlRadius = paramsRef?.current?.resolvedCurlRadius ?? config.curlRadiusLoose;

  const hw = config.pageWidth / 2;
  // Shift left page 0.006 past center so its right edge overlaps the right page's left edge,
  // eliminating the sub-pixel gap that shows the background as a seam line.
  const leftPageX = -hw + 0.006;
  const rightPageX = hw;

  const totalLift = flipProgress + peekProgress;
  const isForward = flipDir >= 0;

  // --- Forward flip ---
  // Flipping page starts on the right, pivots at left edge (world x=0), lands on left.
  // Front = current page front, back = current page back.
  // Underneath (right): next page revealed.

  // --- Backward flip ---
  // Flipping page starts on the left, pivots at right edge (world x=0), lands on right.
  // Front = prev page back (what's showing), back = prev page front.
  // Underneath (left): the page before prevPage.

  const flipPageX = isForward ? hw : -hw;

  let flipFront, flipBack, underPageFront, underPageBack, underPageX, staticFront, staticX;

  if (isForward) {
    // Right page flips to left. Static side = left (doesn't move).
    staticFront = currentSpread > 0 ? pages[currentSpread - 1].back : null;
    staticX = leftPageX;
    flipFront = currentPage.front;
    flipBack = currentPage.back;
    underPageFront = nextPage?.front ?? null;
    underPageBack = nextPage?.back ?? null;
    underPageX = rightPageX;
  } else {
    // Left page flips to right. Static side = right (doesn't move).
    staticFront = currentPage.front;
    staticX = rightPageX;
    flipFront = prevPage?.back ?? null;
    flipBack = prevPage?.front ?? null;
    underPageFront = currentSpread >= 2 ? pages[currentSpread - 2].back : null;
    underPageBack = currentSpread >= 2 ? pages[currentSpread - 2].front : null;
    underPageX = leftPageX;
  }

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 5]} intensity={0.9} />
      <directionalLight position={[-3, 3, 3]} intensity={0.3} />

      {/* Static page on opposite side from flip */}
      <PageMesh
        frontTexture={tex(staticFront)}
        backTexture={tex(staticFront)}
        flipProgress={0}
        peekProgress={0}
        curlRadius={curlRadius}
        position={[staticX, 0, 0]}
      />

      {/* Shadow on static side */}
      <ShadowMesh
        flipProgress={flipProgress}
        peekProgress={peekProgress}
        position={[staticX, 0, 0.002]}
      />

      {/* Stack thickness — opposite side */}
      <PageStack
        side={isForward ? 'left' : 'right'}
        spreadIndex={currentSpread}
        totalSpreads={config.totalSpreads}
      />

      {/* Page underneath (revealed during flip) */}
      {underPageFront && (
        <group>
          <PageMesh
            frontTexture={tex(underPageFront)}
            backTexture={tex(underPageBack)}
            flipProgress={0}
            peekProgress={0}
            curlRadius={curlRadius}
            position={[underPageX, 0, -0.01]}
          />
          <mesh position={[underPageX, 0, -0.009]} renderOrder={1}>
            <planeGeometry args={[config.pageWidth, config.pageHeight]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={Math.max(0, 0.2 - totalLift * 0.2)}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* Stack thickness — flip side */}
      <PageStack
        side={isForward ? 'right' : 'left'}
        spreadIndex={currentSpread}
        totalSpreads={config.totalSpreads}
      />

      {/* === FLIPPING PAGE === */}
      <PageMesh
        frontTexture={tex(flipFront)}
        backTexture={tex(flipBack)}
        flipProgress={flipProgress}
        peekProgress={peekProgress}
        curlRadius={curlRadius}
        flipDir={flipDir}
        position={[flipPageX, 0, 0.001]}
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
