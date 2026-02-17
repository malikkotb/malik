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
import gsap from 'gsap';
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
const MAX_SCALE = 1.8;

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
    const cardsRef = useRef([]);
    const rafRef = useRef(null);
    const lenisRef = useRef(null);

    // Scroll state refs
    const targetScrollRef = useRef(0);
    const animatedScrollRef = useRef(0);

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

    // Calculate scale based on position in viewport (right = large, left = small)
    const calculateScale = useCallback((cardElement) => {
        if (!containerRef.current || !cardElement) return MIN_SCALE;

        const containerRect = containerRef.current.getBoundingClientRect();
        const cardRect = cardElement.getBoundingClientRect();

        // Get the center of the card relative to viewport
        const cardCenter = cardRect.left + cardRect.width / 2;
        const containerLeft = containerRect.left;
        const containerRight = containerRect.right;

        // Normalize position from 0 (left) to 1 (right)
        const normalizedPosition = (cardCenter - containerLeft) / (containerRight - containerLeft);

        // Clamp between 0 and 1
        const clampedPosition = Math.max(0, Math.min(1, normalizedPosition));

        // Linear interpolation: right side (1) = MAX_SCALE, left side (0) = MIN_SCALE
        const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * clampedPosition;

        return scale;
    }, []);

    // Teleport scroll position back to center zone when out of bounds
    const normalizeScroll = useCallback(
        (scroll) => {
            if (contentWidth === 0) return scroll;

            const centerZoneStart = contentWidth * copiesPerSide;
            const centerZoneEnd = centerZoneStart + contentWidth;

            if (scroll < centerZoneStart || scroll >= centerZoneEnd) {
                const withinCycle = ((scroll % contentWidth) + contentWidth) % contentWidth;
                return centerZoneStart + withinCycle;
            }

            return scroll;
        },
        [contentWidth, copiesPerSide]
    );

    // Update scales for all cards based on their current viewport position
    const updateCardScales = useCallback(() => {
        if (!containerRef.current || itemWidth === 0) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerLeft = containerRect.left;
        const containerRight = containerRect.right;
        const containerWidth = containerRight - containerLeft;

        cardsRef.current.forEach((card) => {
            if (!card) return;

            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;

            // Normalize position from 0 (left) to 1 (right)
            const normalizedPosition = (cardCenter - containerLeft) / containerWidth;
            const clampedPosition = Math.max(0, Math.min(1, normalizedPosition));

            // Linear interpolation: right side (1) = MAX_SCALE, left side (0) = MIN_SCALE
            const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * clampedPosition;

            // Use actual width/height instead of scale transform to prevent overlap
            const scaledSize = itemWidth * scale;
            card.style.width = `${scaledSize}px`;
            card.style.height = `${scaledSize}px`;
        });
    }, [itemWidth]);

    // Animation loop: lerp toward target & normalize if needed
    const animate = useCallback(() => {
        const track = trackRef.current;
        if (!track || contentWidth === 0) {
            rafRef.current = requestAnimationFrame(animate);
            return;
        }

        // 1. Lerp animated position toward target
        const target = targetScrollRef.current;
        const current = animatedScrollRef.current;
        const distance = Math.abs(target - current);
        const next = distance < LERP_THRESHOLD
            ? target
            : current + (target - current) * LERP_FACTOR;

        animatedScrollRef.current = next;

        // 2. Check if we need to teleport (normalize)
        const normalized = normalizeScroll(next);

        if (normalized !== next) {
            const offset = normalized - next;
            animatedScrollRef.current = normalized;
            targetScrollRef.current += offset;
        }

        // 3. Apply transform with final position (either lerped or normalized)
        track.style.transform = `translateX(${-animatedScrollRef.current}px)`;

        // 4. Force layout calculation to ensure transform is applied before scale calculation
        void track.offsetHeight;

        // 5. Update scales based on new viewport positions
        updateCardScales();

        rafRef.current = requestAnimationFrame(animate);
    }, [normalizeScroll, contentWidth, updateCardScales]);

    // Wheel handler
    const handleWheel = useCallback(
        (event) => {
            event.preventDefault();
            const delta = event.deltaY !== 0 ? event.deltaY : event.deltaX;
            targetScrollRef.current += delta * WHEEL_MULTIPLIER;
        },
        []
    );

    // Pointer/drag handlers
    const handlePointerDown = useCallback((event) => {
        isDraggingRef.current = true;
        lastPointerXRef.current = event.clientX;
        containerRef.current?.setPointerCapture(event.pointerId);
    }, []);

    const handlePointerMove = useCallback((event) => {
        if (!isDraggingRef.current) return;

        const deltaX = event.clientX - lastPointerXRef.current;
        lastPointerXRef.current = event.clientX;

        targetScrollRef.current -= deltaX * DRAG_MULTIPLIER;
    }, []);

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

            // Initialize scroll to center zone
            if (totalContentW > 0) {
                const copies = Math.min(
                    MAX_COPIES_PER_SIDE,
                    Math.max(3, Math.ceil(containerW / totalContentW) + BUFFER)
                );
                const initialScroll = totalContentW * copies;
                targetScrollRef.current = initialScroll;
                animatedScrollRef.current = initialScroll;
            }
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
                    ref={(el) => {
                        if (el && !cardsRef.current.includes(el)) {
                            cardsRef.current.push(el);
                        }
                    }}
                    className="flex-shrink-0"
                    style={{
                        width: `${itemWidth}px`,
                        height: `${itemWidth}px`,
                        aspectRatio: '1/1',
                        transformOrigin: 'bottom center',
                        willChange: 'width, height',
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
                            aspectRatio: '1/1',
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
                className="flex items-end"
                style={{
                    willChange: 'transform',
                    gap: 0,
                    lineHeight: 0,
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
