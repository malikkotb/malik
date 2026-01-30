'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { GridTile } from './GridTile';
import { generateMatrix, getMatrixItem } from './utils';

// Fixed large pool size that covers most viewports
const MAX_COLS = 10;
const MAX_ROWS = 10;
const TOTAL_TILES = MAX_COLS * MAX_ROWS;

export function GridScene({ dragState, tileSize, items = [] }) {
  const { size } = useThree();
  const tilesRef = useRef([]);

  // Matrix with alternating empty slots for checkerboard pattern
  const itemsBaseGrid = useMemo(
    () => generateMatrix(items.map((_, i) => i)),
    [items.length]
  );

  // Animation loop
  useFrame((_, delta) => {
    const state = dragState.current;
    const decay = 0.92;

    if (state.isDragging) {
      // Direct follow during drag
      state.currentX = state.targetX;
      state.currentY = state.targetY;
    } else {
      // Apply momentum
      state.velocityX *= decay;
      state.velocityY *= decay;

      // Stop if velocity is tiny
      if (Math.abs(state.velocityX) < 0.1) state.velocityX = 0;
      if (Math.abs(state.velocityY) < 0.1) state.velocityY = 0;

      state.currentX += state.velocityX * delta;
      state.currentY += state.velocityY * delta;
      state.targetX = state.currentX;
      state.targetY = state.currentY;
    }

    // Calculate visible cols/rows based on current viewport
    const visibleCols = Math.ceil(size.width / tileSize) + 2;
    const visibleRows = Math.ceil(size.height / tileSize) + 2;

    // Calculate grid offset (which cell we're at)
    const gridOffsetX = Math.floor(state.currentX / tileSize);
    const gridOffsetY = Math.floor(state.currentY / tileSize);

    // Sub-cell offset for smooth movement
    const subOffsetX = state.currentX % tileSize;
    const subOffsetY = state.currentY % tileSize;

    // Half grid for centering
    const halfCols = Math.floor(visibleCols / 2);
    const halfRows = Math.floor(visibleRows / 2);

    // Update each tile
    tilesRef.current.forEach((tile, index) => {
      if (!tile) return;

      const localCol = index % MAX_COLS;
      const localRow = Math.floor(index / MAX_COLS);

      // Hide tiles outside visible range
      if (localCol >= visibleCols || localRow >= visibleRows) {
        tile.visible = false;
        return;
      }

      // Grid position this tile represents
      const gridCol = localCol - halfCols - gridOffsetX;
      const gridRow = localRow - halfRows + gridOffsetY;

      // World position (centered around origin)
      tile.position.x = gridCol * tileSize + subOffsetX;
      tile.position.y = -gridRow * tileSize + subOffsetY;

      // Get content from wrapped matrix position
      const contentIndex = getMatrixItem(itemsBaseGrid, gridRow, gridCol);
      tile.userData.contentIndex = contentIndex;
      tile.visible = contentIndex !== null;
    });
  });

  // Create fixed tile pool (never recreated)
  const tiles = useMemo(() => {
    return Array.from({ length: TOTAL_TILES }, (_, i) => {
      const item = items[i % Math.max(items.length, 1)] || {};
      return (
        <GridTile
          key={i}
          ref={(el) => (tilesRef.current[i] = el)}
          size={tileSize}
          dragState={dragState}
          color={item.color || '#c9c9c9'}
        />
      );
    });
  }, [tileSize, dragState, items]);

  return <group>{tiles}</group>;
}
