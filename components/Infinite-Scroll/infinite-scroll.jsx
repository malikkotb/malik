'use client';

function run(fn) {
  return fn();
}

/**
 * InfiniteScroll
 *
 * How it works:
 *
 * 1. DOM Structure: Renders content copies before and after the "real" content
 *    [copies] [REAL CONTENT] [copies]
 *
 * 2. Virtual Scrolling: Intercepts wheel/touch events and manually controls scroll
 *    - Prevents native scroll behavior with preventDefault()
 *    - Accumulates deltas into a target position
 *    - RAF loop smoothly interpolates (lerps) toward target at display refresh rate
 *
 * 3. Infinite Loop: When scroll exits the center zone, it "teleports" back
 *    - Normalizes both target AND animated positions by the same offset
 *    - Visual content is identical, so the user never notices the jump
 *    - Works even during super-fast scrolling
 *
 * Key Concepts:
 *
 * - targetScrollRef: Where we WANT to be (updated by input events)
 * - animatedScrollRef: Where we ARE (smoothly lerps toward target)
 * - normalizeScroll: Teleports positions back to center when out of bounds
 * - LERP_FACTOR: Lower = smoother (0.1 = buttery smooth)
 */

import * as React from 'react';

const BUFFER = 2;
const MAX_AROUND = 12; // Hard cap to avoid excessive DOM nodes
const LERP_FACTOR = 0.1; // Smooth lerp (lower = smoother)
const LERP_THRESHOLD = 0.01; // Stop lerping when within this many pixels
const LINE_HEIGHT = 100 / 6; // Line height for wheel deltaMode === 1
const WHEEL_MULTIPLIER = 1;
const TOUCH_MULTIPLIER = 2; // Higher = more responsive touch scrolling

export function InfiniteScroll({
  children,
  style,
  ...rest
}) {
  const contentRef = React.useRef(null);
  const scrollRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const targetScrollRef = React.useRef(0);
  const animatedScrollRef = React.useRef(0);
  const touchStartRef = React.useRef({ x: 0, y: 0 });
  const [contentHeight, setContentHeight] = React.useState(0);
  const [containerHeight, setContainerHeight] = React.useState(0);
  const lastContentHeightRef = React.useRef(0);
  const lastContainerHeightRef = React.useRef(0);
  const id = React.useId();

  // Calculate how many content copies we need on each side
  const copiesPerSide = run(() => {
    if (contentHeight === 0 || containerHeight === 0) {
      return 2;
    }

    const maxPerSide = Math.max(1, Math.floor(MAX_AROUND / 2));
    const requiredPerSide = Math.max(
      0,
      Math.ceil(containerHeight / contentHeight) - 1
    );
    const withBuffer = requiredPerSide + BUFFER;

    return Math.min(maxPerSide, Math.max(1, withBuffer));
  });

  // Teleport scroll position back to center zone when out of bounds
  const normalizeScroll = React.useCallback(
    (scroll) => {
      if (contentHeight === 0) {
        return scroll;
      }

      const centerZoneStart = contentHeight * copiesPerSide;
      const centerZoneEnd = centerZoneStart + contentHeight;

      // If outside center zone, teleport back using modulo
      if (scroll < centerZoneStart || scroll >= centerZoneEnd) {
        const withinCycle =
          ((scroll % contentHeight) + contentHeight) % contentHeight;
        return centerZoneStart + withinCycle;
      }

      return scroll;
    },
    [contentHeight, copiesPerSide]
  );

  // RAF loop: lerp toward target & normalize if needed (runs at display refresh rate)
  const animate = React.useCallback(() => {
    const element = scrollRef.current;

    if (!element || contentHeight === 0) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    // 1. Lerp animated position toward target
    const target = targetScrollRef.current;
    const current = animatedScrollRef.current;
    const distance = Math.abs(target - current);
    const next =
      distance < LERP_THRESHOLD
        ? target
        : current + (target - current) * LERP_FACTOR;

    animatedScrollRef.current = next;

    // 2. Check if we need to teleport (normalize)
    const normalized = normalizeScroll(next);

    if (normalized !== next) {
      // Teleport! Apply same offset to both refs to stay in sync
      const offset = normalized - next;
      animatedScrollRef.current = normalized;
      targetScrollRef.current += offset;
    }

    // 3. Apply the scroll
    element.scrollTo({ top: animatedScrollRef.current, behavior: 'instant' });

    rafRef.current = requestAnimationFrame(animate);
  }, [normalizeScroll, contentHeight]);

  // Wheel: capture deltas and update target (RAF will smooth it)
  const handleWheel = React.useCallback(
    (event) => {
      event.preventDefault();

      const { deltaY, deltaMode } = event;
      const multiplier =
        deltaMode === 1
          ? LINE_HEIGHT
          : deltaMode === 2
          ? containerHeight || window.innerHeight
          : 1;

      targetScrollRef.current += deltaY * multiplier * WHEEL_MULTIPLIER;
    },
    [containerHeight]
  );

  // Touch: track deltas and update target
  const handleTouchStart = React.useCallback((event) => {
    const touch = event.targetTouches?.[0] ?? event.changedTouches?.[0];

    if (!touch) {
      return;
    }

    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = React.useCallback((event) => {
    event.preventDefault();

    const touch = event.targetTouches?.[0] ?? event.changedTouches?.[0];

    if (!touch) {
      return;
    }

    const deltaY =
      -(touch.clientY - touchStartRef.current.y) * TOUCH_MULTIPLIER;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };

    targetScrollRef.current += deltaY;
  }, []);

  // Start the continuous RAF loop
  React.useLayoutEffect(() => {
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [animate]);

  // Cleanup RAF on unmount (safety net)
  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  // Set up virtual scroll event listeners
  React.useLayoutEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    const element = scrollRef.current;

    element.addEventListener('wheel', handleWheel, {
      passive: false,
    });
    element.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    element.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });

    return () => {
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener(
        'touchstart',
        handleTouchStart
      );
      element.removeEventListener(
        'touchmove',
        handleTouchMove
      );
    };
  }, [handleWheel, handleTouchStart, handleTouchMove]);

  // Track dimensions and initialize scroll position
  React.useLayoutEffect(() => {
    if (!contentRef.current || !scrollRef.current) {
      return;
    }

    const contentEl = contentRef.current;
    const scrollEl = scrollRef.current;

    // Single ResizeObserver for both elements
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === contentEl) {
          const measured = contentEl.offsetHeight;
          if (measured !== lastContentHeightRef.current) {
            lastContentHeightRef.current = measured;
            setContentHeight(measured);
          }
        } else if (entry.target === scrollEl) {
          const measured = scrollEl.clientHeight;
          if (measured !== lastContainerHeightRef.current) {
            lastContainerHeightRef.current = measured;
            setContainerHeight(measured);
          }
        }
      }
    });

    resizeObserver.observe(contentEl);
    resizeObserver.observe(scrollEl);

    // Initialize scroll to center zone
    const currentContentHeight = contentEl.offsetHeight;

    if (currentContentHeight > 0) {
      const initialScroll = currentContentHeight * copiesPerSide;
      scrollEl.scrollTop = initialScroll;
      targetScrollRef.current = initialScroll;
      animatedScrollRef.current = initialScroll;
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [copiesPerSide]);

  // Generate stable keys for copies (avoids remount churn)
  const keys = React.useMemo(() => {
    const maxKeys = Math.max(1, Math.floor(MAX_AROUND / 2));
    return {
      before: Array.from({ length: maxKeys }, (_, i) => `before-${id}-${i}`),
      after: Array.from({ length: maxKeys }, (_, i) => `after-${id}-${i}`),
    };
  }, [id]);

  const beforeKeys = keys.before.slice(0, copiesPerSide);
  const afterKeys = keys.after.slice(0, copiesPerSide);

  return (
    <div
      ref={scrollRef}
      style={{
        overflowY: 'auto',
        overscrollBehavior: 'none',
        overflowAnchor: 'none',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none', // IE/Edge
        ...style,
      }}
      {...rest}
    >
      {beforeKeys.map((key) => (
        <div key={key} aria-hidden="true">
          {children}
        </div>
      ))}

      <div ref={contentRef}>{children}</div>

      {afterKeys.map((key) => (
        <div key={key} aria-hidden="true">
          {children}
        </div>
      ))}
    </div>
  );
}
