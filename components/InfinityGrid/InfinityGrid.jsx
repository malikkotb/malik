'use client';

import {
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
} from 'motion/react';
import React from 'react';
import {
  generateMatrix,
  getItemDistanceFromContainer,
  getMatrixItem,
  isPointInsideBounds,
  matrix,
} from './utils';
import { useLatest } from './hooks';

const ITEM_SIZE = 300; // Fixed size for each grid tile

// Renders a single grid tile with animation
const GridItem = React.memo((props) => {
  const { item, children, width, height } = props;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      key={item.id}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        x: item.coordinates.x,
        y: item.coordinates.y,
        width,
        height,
      }}
    >
      {children}
    </motion.div>
  );
});

export const InfiniteGrid = (props) => {
  const containerRef = React.useRef(null);
  const dragWrapperRef = React.useRef(null);

  // Store children and count once
  const children = React.useMemo(() => {
    const array = React.Children.toArray(props.children);
    return { count: array.length, items: array };
  }, [props.children]);

  const [isReady, setIsReady] = React.useState(false);
  const status = React.useRef('initializing');

  // Base matrix with alternating empty slots
  const itemsBaseGrid = React.useMemo(
    () => generateMatrix([...Array(children.count)].map((_, index) => index)),
    [children.count]
  );

  const [items, setItems] = React.useState([]);
  const itemsRef = useLatest(items);

  // Drag state
  const dragControls = useDragControls();
  const dragMotionValueX = useMotionValue(0);
  const dragMotionValueY = useMotionValue(0);

  // Initial tile layout
  const setupItems = React.useCallback(() => {
    if (!containerRef.current) return;

    const { clientWidth: containerWidth, clientHeight: containerHeight } =
      containerRef.current;

    // Ensure grid fills container plus one extra row/column
    const minColsNumber = Math.ceil(containerWidth / ITEM_SIZE) + 1;
    const minRowsNumber = Math.ceil(containerHeight / ITEM_SIZE) + 1;

    // Center offset ensures grid starts centered
    const centerOffsetX = (minColsNumber * ITEM_SIZE - containerWidth) / 2;
    const centerOffsetY = (minRowsNumber * ITEM_SIZE - containerHeight) / 2;

    const itemsArray = [];

    for (let rowIndex = 0; rowIndex < minRowsNumber; rowIndex++) {
      for (let colIndex = 0; colIndex < minColsNumber; colIndex++) {
        itemsArray.push({
          id: `${rowIndex}-${colIndex}`,
          childrenIndex: getMatrixItem(itemsBaseGrid, rowIndex, colIndex),
          gridIndex: { row: rowIndex, col: colIndex },
          coordinates: {
            x: colIndex * ITEM_SIZE - centerOffsetX,
            y: rowIndex * ITEM_SIZE - centerOffsetY,
          },
        });
      }
    }

    setItems(itemsArray);
    setIsReady(true);
    status.current = 'idle';
  }, [itemsBaseGrid]);

  // Runs whenever drag position changes
  const onUpdate = React.useCallback(() => {
    if (!containerRef.current) return;

    const dragXValue = dragMotionValueX.get();
    const dragYValue = dragMotionValueY.get();

    const {
      clientTop: top,
      clientLeft: left,
      clientHeight: bottom,
      clientWidth: right,
    } = containerRef.current;
    const containerBounds = { top, bottom, left, right };

    const itemsToAdd = [];
    const itemsToRemove = [];

    for (const item of itemsRef.current) {
      // Center point of the tile relative to container
      const itemCenterPoint = {
        x:
          item.coordinates.x +
          dragXValue +
          containerBounds.left +
          ITEM_SIZE / 2,
        y:
          item.coordinates.y + dragYValue + containerBounds.top + ITEM_SIZE / 2,
      };

      const isInside = isPointInsideBounds(itemCenterPoint, containerBounds);

      if (isInside) {
        // Add surrounding tiles based on matrix positions
        for (const pos of matrix) {
          const [x, y] = pos;
          const rowIndex = item.gridIndex.row + y;
          const colIndex = item.gridIndex.col + x;
          const id = `${rowIndex}-${colIndex}`;

          // Skip if tile already exists
          if (
            [...itemsRef.current, ...itemsToAdd].find(
              (_item) => id === _item.id
            )
          )
            continue;

          const newItem = {
            id,
            childrenIndex: getMatrixItem(itemsBaseGrid, rowIndex, colIndex),
            gridIndex: { row: rowIndex, col: colIndex },
            coordinates: {
              x: item.coordinates.x + ITEM_SIZE * x,
              y: item.coordinates.y + ITEM_SIZE * y,
            },
          };

          itemsToAdd.push(newItem);
        }
      } else {
        // Remove tiles too far from viewport
        const distance = getItemDistanceFromContainer(
          itemCenterPoint,
          ITEM_SIZE,
          ITEM_SIZE,
          containerBounds
        );
        if (distance > 0) itemsToRemove.push(item.id);
      }
    }

    // Skip if no changes
    if (itemsToAdd.length === 0 && itemsToRemove.length === 0) return;

    // Update tiles and keep them unique
    setItems((curr) => {
      const combinedItems = [...curr, ...itemsToAdd].filter(
        (item) => !itemsToRemove.includes(item.id)
      );
      const uniqueItems = new Map(combinedItems.map((item) => [item.id, item]));
      return Array.from(uniqueItems.values());
    });
  }, [itemsBaseGrid, itemsRef]);

  // Listen to drag changes
  useMotionValueEvent(dragMotionValueX, 'change', onUpdate);
  useMotionValueEvent(dragMotionValueY, 'change', onUpdate);

  // Handle container resize
  React.useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => onUpdate());
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [onUpdate]);

  // Setup initial tiles
  React.useEffect(() => {
    if (!isReady) setupItems();
  }, [isReady, setupItems]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        cursor: 'grab',
        height: "calc(100vh)",
        overflow: 'hidden',
      }}
      onPointerDown={(e) => {
        dragControls.start(e);
        if (containerRef.current)
          containerRef.current.style.cursor = 'grabbing';
      }}
      onPointerUp={() => {
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
      }}
      onClickCapture={(e) => {
        if (status.current !== 'idle') {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <motion.div
        drag
        ref={dragWrapperRef}
        dragControls={dragControls}
        dragListener={false}
        dragTransition={{ timeConstant: 250, power: 0.3 }}
        onDragStart={() => {
          status.current = 'dragging';
        }}
        onDragEnd={() => {
          status.current = 'idle';
        }}
        onUpdate={({ x, y }) => {
          if (typeof x !== 'number' || typeof y !== 'number') return;
          dragMotionValueX.set(x);
          dragMotionValueY.set(y);
        }}
      >
        {items.map((item) => {
          if (item.childrenIndex === null) return null;
          const child = children.items[item.childrenIndex];
          return (
            <GridItem
              key={item.id}
              item={item}
              width={ITEM_SIZE}
              height={ITEM_SIZE}
            >
              {child}
            </GridItem>
          );
        })}
      </motion.div>
    </div>
  );
};
