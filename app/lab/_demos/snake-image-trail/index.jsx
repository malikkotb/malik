'use client';

/**
 * SnakeImageTrail
 *
 * Scroll-driven image trail effect where images spawn along a sinusoidal snake path.
 * Images scale up (bulge) when near the viewport center.
 * Inspired by: https://pabloescudero.com/
 */

import { useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import Lenis from 'lenis';

// Configuration
const CONFIG = {
    TOTAL_IMAGES: 60,      // More images for denser, smoother trail
    IMAGE_SIZE: 150,
    AMPLITUDE: 0.1875,     // ~19% of viewport width (reduced by 25%)
    WAVES: 2.5,            // More waves for more dominant curves
    MIN_SCALE: 0.6,
    MAX_SCALE: 1.4,
    SCROLL_HEIGHT: 600,    // vh
};

// Sample images - cycle through these
const IMAGES = [
    '/demos/fancy_img1.webp',
    '/demos/fancy_img2.webp',
    '/demos/fancy_img3.webp',
    '/demos/fancy_img4.webp',
    '/demos/fancy_img5.webp',
    '/demos/fancy_img6.webp',
    '/demos/fancy_img7.webp',
];

export default function SnakeImageTrail() {
    const containerRef = useRef(null);
    const viewportRef = useRef(null);
    const imagePoolRef = useRef([]);
    const rafRef = useRef(null);
    const lenisRef = useRef(null);
    const scrollProgressRef = useRef(0);

    // Calculate snake path position for a given normalized index (0-1)
    // Uses a smooth sinusoidal curve with gentle easing
    const calculateSnakePosition = useCallback((t, viewportWidth, viewportHeight) => {
        const centerX = viewportWidth / 2;
        const amplitude = viewportWidth * CONFIG.AMPLITUDE;
        const pathLength = viewportHeight * (CONFIG.SCROLL_HEIGHT / 100) * 0.85;

        // Smooth sine wave - the key is using a continuous, gentle curve
        // Phase offset to start from center and curve right first
        const phase = -Math.PI / 2;
        const x = centerX + amplitude * Math.sin(t * Math.PI * 2 * CONFIG.WAVES + phase);

        // Y progresses linearly along the path
        const y = t * pathLength;

        return { x, y };
    }, []);

    // Calculate scale based on distance from viewport center
    const calculateBulgeScale = useCallback((imageY, viewportHeight) => {
        const viewportCenterY = viewportHeight / 2;
        const distanceFromCenter = Math.abs(imageY - viewportCenterY);
        const normalizedDistance = Math.min(1, distanceFromCenter / (viewportHeight / 2));

        // Quadratic falloff for smoother bulge
        const scale = CONFIG.MIN_SCALE +
            (CONFIG.MAX_SCALE - CONFIG.MIN_SCALE) * (1 - Math.pow(normalizedDistance, 2));

        return Math.max(CONFIG.MIN_SCALE, Math.min(CONFIG.MAX_SCALE, scale));
    }, []);

    // Animation loop - updates visuals based on scroll progress
    const updateVisuals = useCallback(() => {
        const viewport = viewportRef.current;
        const pool = imagePoolRef.current;

        if (!viewport || pool.length === 0) return;

        const progress = scrollProgressRef.current;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate how many images should be visible based on scroll progress
        // Add a small buffer (+1) for smoother appearance
        const visibleCount = Math.min(CONFIG.TOTAL_IMAGES, Math.floor(progress * CONFIG.TOTAL_IMAGES) + 1);

        pool.forEach((img, i) => {
            if (i < visibleCount) {
                // Calculate normalized position along the path (0-1)
                const t = i / CONFIG.TOTAL_IMAGES;

                // Get position on snake path
                const { x, y } = calculateSnakePosition(t, viewportWidth, viewportHeight);

                // Calculate visual Y position relative to viewport
                // As we scroll, the path moves up
                const scrollOffset = progress * viewportHeight * (CONFIG.SCROLL_HEIGHT / 100) * 0.85;
                const visualY = y - scrollOffset + viewportHeight;

                // Calculate bulge scale based on visual Y position
                const scale = calculateBulgeScale(visualY, viewportHeight);

                // Apply transforms
                img.style.transform = `translate(${x - CONFIG.IMAGE_SIZE / 2}px, ${visualY - CONFIG.IMAGE_SIZE / 2}px) scale(${scale})`;
                img.style.opacity = 1;
                img.style.zIndex = Math.round(scale * 100);
            } else {
                img.style.opacity = 0;
            }
        });
    }, [calculateSnakePosition, calculateBulgeScale]);

    // Initialize Lenis for smooth scroll
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        lenisRef.current = lenis;

        // Track scroll progress
        lenis.on('scroll', ({ progress }) => {
            scrollProgressRef.current = progress;
        });

        // Unified RAF loop - updates both Lenis and visuals together
        function raf(time) {
            lenis.raf(time);
            updateVisuals();
            rafRef.current = requestAnimationFrame(raf);
        }
        rafRef.current = requestAnimationFrame(raf);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            lenis.destroy();
        };
    }, [updateVisuals]);

    // Create image pool
    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        // Clear existing images
        viewport.innerHTML = '';
        imagePoolRef.current = [];

        // Create image pool
        for (let i = 0; i < CONFIG.TOTAL_IMAGES; i++) {
            const imgWrapper = document.createElement('div');
            imgWrapper.style.cssText = `
                position: absolute;
                width: ${CONFIG.IMAGE_SIZE}px;
                height: ${CONFIG.IMAGE_SIZE}px;
                opacity: 0;
                will-change: transform, opacity;
                transform-origin: center center;
                transition: opacity 0.15s ease-out;
            `;

            const img = document.createElement('img');
            img.src = IMAGES[i % IMAGES.length];
            img.alt = `Trail image ${i + 1}`;
            img.draggable = false;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                pointer-events: none;
            `;

            imgWrapper.appendChild(img);
            viewport.appendChild(imgWrapper);
            imagePoolRef.current.push(imgWrapper);
        }
    }, []);


    return (
        <div
            ref={containerRef}
            style={{
                height: `${CONFIG.SCROLL_HEIGHT}vh`,
                width: '100%',
                position: 'relative',
            }}
        >
            {/* Fixed viewport for visual effect */}
            <div
                ref={viewportRef}
                style={{
                    position: 'fixed',
                    inset: 0,
                    overflow: 'hidden',
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}
