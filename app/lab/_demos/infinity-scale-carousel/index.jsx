'use client';

/**
 * InfinityScaleCarousel
 *
 * Simple horizontal infinite carousel with scale gradient:
 * - All cards stuck to bottom, no gaps
 * - Scale down smoothly from right to left
 * - Seamless infinite looping
 */

import { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import Lenis from 'lenis';

// Configuration
const BUFFER = 3;
const MAX_COPIES_PER_SIDE = 6;
const LERP_FACTOR = 0.1;
const LERP_THRESHOLD = 0.1;
const WHEEL_MULTIPLIER = 1.5;
const DRAG_MULTIPLIER = 1;

// Scale configuration - simple gradient from right to left
const MIN_SCALE = 0.7;
const MAX_SCALE = 2.0;
const SCALE_EXPONENT = 0.6; // Gentle exponential curve

// Sample images
const IMAGES = [
    'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800',
    'https://images.unsplash.com/photo-1682687221038-404cb8830901?w=800',
    'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800',
    'https://images.unsplash.com/photo-1682687219356-e820ca126c92?w=800',
    'https://images.unsplash.com/photo-1682687220923-c58b9a4592ae?w=800',
];

export default function InfinityScaleCarousel() {
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const rafRef = useRef(null);
    const lenisRef = useRef(null);

    // Scroll state refs (parametric - in image units)
    const targetParamScrollRef = useRef(0);
    const animatedParamScrollRef = useRef(0);

    // Drag state
    const isDraggingRef = useRef(false);
    const lastPointerXRef = useRef(0);

    // Dimensions
    const [contentWidth, setContentWidth] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const [itemWidth, setItemWidth] = useState(0);

    // Calculate copies needed per side
    const copiesPerSide = (() => {
        if (contentWidth === 0 || containerWidth === 0) return 3;
        const required = Math.ceil(containerWidth / contentWidth);
        return Math.min(MAX_COPIES_PER_SIDE, Math.max(3, required + BUFFER));
    })();

    // Teleport parametric scroll position back to center zone when out of bounds
    const normalizeParametricScroll = useCallback(
        (scroll) => {
            const imageCount = IMAGES.length;
            if (imageCount === 0) return scroll;

            const centerZoneStart = copiesPerSide * imageCount;
            const centerZoneEnd = centerZoneStart + imageCount;

            if (scroll < centerZoneStart || scroll >= centerZoneEnd) {
                const withinCycle = ((scroll % imageCount) + imageCount) % imageCount;
                return centerZoneStart + withinCycle;
            }

            return scroll;
        },
        [copiesPerSide]
    );

    // Calculate positions and scales for all cards based on parametric scroll
    const calculateAllPositionsAndScales = useCallback((parametricScroll) => {
        if (itemWidth === 0) return [];

        const containerW = containerRef.current?.clientWidth || window.innerWidth;
        const baseW = itemWidth;

        // Estimate visible count for normalization
        const avgScale = (MIN_SCALE + MAX_SCALE) / 2;
        const visibleCount = Math.ceil(containerW / (baseW * MIN_SCALE)) + 2;

        const totalImages = (copiesPerSide * 2 + 1) * IMAGES.length;
        const results = [];

        // Pass 1: Calculate all scales based on parametric index
        for (let i = 0; i < totalImages; i++) {
            const relativeParam = i - parametricScroll;
            const normalized = relativeParam / visibleCount;
            const clamped = Math.max(0, Math.min(1, normalized));
            const eased = Math.pow(clamped, SCALE_EXPONENT);
            results[i] = {
                scale: MIN_SCALE + (MAX_SCALE - MIN_SCALE) * eased,
                globalIndex: i
            };
        }

        // Pass 2: Calculate cumulative centers (adjacent scaled edges touch)
        let cumulativeCenter = 0;
        for (let i = 0; i < totalImages; i++) {
            if (i === 0) {
                results[i].center = 0;
            } else {
                // Gap between centers = half of previous + half of current scaled width
                const gap = baseW * (results[i - 1].scale + results[i].scale) / 2;
                cumulativeCenter += gap;
                results[i].center = cumulativeCenter;
            }
        }

        // Pass 3: Convert to visual positions relative to viewport
        // Find what world position corresponds to left edge of viewport
        const floorIndex = Math.floor(parametricScroll);
        const fraction = parametricScroll - floorIndex;
        const clampedFloor = Math.max(0, Math.min(totalImages - 2, floorIndex));

        // Interpolate scroll offset in world space
        const worldScrollOffset = results[clampedFloor].center +
            fraction * baseW * (results[clampedFloor].scale + results[Math.min(clampedFloor + 1, totalImages - 1)].scale) / 2;

        // Calculate visual positions
        // Position the card so its CENTER (before scaling) is at the calculated center point
        // Since transform-origin is 'center bottom', scale happens from the center
        for (let i = 0; i < totalImages; i++) {
            const scaledW = baseW * results[i].scale;
            // Position so the element's center is at the world center point
            results[i].visualLeft = results[i].center - baseW / 2 - worldScrollOffset;
            results[i].visualRight = results[i].visualLeft + scaledW;

            // Z-index: larger scale = higher z-index
            results[i].zIndex = Math.round((results[i].scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE) * 100);
        }

        return results;
    }, [itemWidth, copiesPerSide]);

    // Animation loop: lerp toward target & normalize if needed
    const animate = useCallback(() => {
        const track = trackRef.current;
        if (!track || itemWidth === 0) {
            rafRef.current = requestAnimationFrame(animate);
            return;
        }

        // 1. Lerp animated parametric position toward target
        const target = targetParamScrollRef.current;
        const current = animatedParamScrollRef.current;
        const distance = Math.abs(target - current);
        const next = distance < (LERP_THRESHOLD / itemWidth)
            ? target
            : current + (target - current) * LERP_FACTOR;

        animatedParamScrollRef.current = next;

        // 2. Check if we need to teleport (normalize)
        const normalized = normalizeParametricScroll(next);

        if (normalized !== next) {
            const offset = normalized - next;
            animatedParamScrollRef.current = normalized;
            targetParamScrollRef.current += offset;
        }

        // 3. Calculate all positions and scales
        const layout = calculateAllPositionsAndScales(animatedParamScrollRef.current);

        // 4. Apply transforms to each card
        const cards = track.querySelectorAll('[data-index]');
        cards.forEach((card) => {
            const globalIndex = parseInt(card.dataset.index, 10);
            if (isNaN(globalIndex) || !layout[globalIndex]) return;

            const { visualLeft, scale, zIndex } = layout[globalIndex];

            // Apply individual position and scale
            card.style.transform = `translateX(${visualLeft}px) scale(${scale})`;
            card.style.zIndex = zIndex;
        });

        rafRef.current = requestAnimationFrame(animate);
    }, [normalizeParametricScroll, itemWidth, calculateAllPositionsAndScales]);

    // Wheel handler
    const handleWheel = useCallback(
        (event) => {
            event.preventDefault();
            const deltaPixels = event.deltaY !== 0 ? event.deltaY : event.deltaX;

            // Convert pixel delta to parametric delta
            if (itemWidth > 0) {
                const avgScale = (MIN_SCALE + MAX_SCALE) / 2;
                const avgScaledWidth = itemWidth * avgScale;
                const parametricDelta = (deltaPixels * WHEEL_MULTIPLIER) / avgScaledWidth;
                targetParamScrollRef.current += parametricDelta;
            }
        },
        [itemWidth]
    );

    // Pointer/drag handlers
    const handlePointerDown = useCallback((event) => {
        isDraggingRef.current = true;
        lastPointerXRef.current = event.clientX;
        containerRef.current?.setPointerCapture(event.pointerId);
    }, []);

    const handlePointerMove = useCallback((event) => {
        if (!isDraggingRef.current) return;

        const deltaPixels = event.clientX - lastPointerXRef.current;
        lastPointerXRef.current = event.clientX;

        // Convert pixel delta to parametric delta
        if (itemWidth > 0) {
            const avgScale = (MIN_SCALE + MAX_SCALE) / 2;
            const avgScaledWidth = itemWidth * avgScale;
            const parametricDelta = (deltaPixels * DRAG_MULTIPLIER) / avgScaledWidth;
            targetParamScrollRef.current -= parametricDelta;
        }
    }, [itemWidth]);

    const handlePointerUp = useCallback((event) => {
        isDraggingRef.current = false;
        containerRef.current?.releasePointerCapture(event.pointerId);
    }, []);

    // Initialize Lenis smooth scroll
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'horizontal',
            gestureOrientation: 'both',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        lenisRef.current = lenis;

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    // Start animation loop
    useLayoutEffect(() => {
        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [animate]);

    // Set up event listeners
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [handleWheel]);

    // Measure dimensions and initialize scroll position
    useLayoutEffect(() => {
        const container = containerRef.current;
        const track = trackRef.current;
        if (!container || !track) return;

        const measureAndInit = () => {
            const containerW = container.clientWidth;
            const viewportHeight = window.innerHeight;
            const singleItemW = viewportHeight * 0.3; // 30vh per item
            const totalContentW = singleItemW * IMAGES.length;

            setContainerWidth(containerW);
            setItemWidth(singleItemW);
            setContentWidth(totalContentW);

            // Initialize parametric scroll to center zone
            const copies = Math.min(
                MAX_COPIES_PER_SIDE,
                Math.max(3, Math.ceil(containerW / totalContentW) + BUFFER)
            );
            const initialParamScroll = IMAGES.length * copies;
            targetParamScrollRef.current = initialParamScroll;
            animatedParamScrollRef.current = initialParamScroll;
        };

        measureAndInit();

        const resizeObserver = new ResizeObserver(measureAndInit);
        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, []);

    // Generate content for rendering
    const renderContent = (copyIndex) => {
        return IMAGES.map((src, imageIndex) => {
            const globalIndex = copyIndex * IMAGES.length + imageIndex;

            return (
                <div
                    key={`${copyIndex}-${imageIndex}`}
                    style={{
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        width: `${itemWidth}px`,
                        height: `${itemWidth}px`,
                        transformOrigin: 'center bottom',
                        willChange: 'transform',
                    }}
                    data-index={globalIndex}
                >
                    <img
                        className="w-full h-full object-cover"
                        src={src}
                        alt={`Image ${imageIndex + 1}`}
                        draggable={false}
                        style={{
                            display: 'block',
                        }}
                    />
                </div>
            );
        });
    };

    return (
        <div
            ref={containerRef}
            className="w-full absolute h-screen top-0 left-0 overflow-hidden flex items-end cursor-grab active:cursor-grabbing"
            style={{
                touchAction: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <div
                ref={trackRef}
                style={{
                    position: 'relative',
                    height: `${itemWidth * MAX_SCALE}px`,
                    width: '100%',
                    willChange: 'transform',
                }}
            >
                {/* Before copies */}
                {Array.from({ length: copiesPerSide }, (_, copyIndex) =>
                    renderContent(copyIndex)
                )}

                {/* Real content (center zone) */}
                {renderContent(copiesPerSide)}

                {/* After copies */}
                {Array.from({ length: copiesPerSide }, (_, copyIndex) =>
                    renderContent(copiesPerSide + 1 + copyIndex)
                )}
            </div>
        </div>
    );
}
