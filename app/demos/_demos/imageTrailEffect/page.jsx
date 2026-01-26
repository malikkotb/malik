"use client";

import { useEffect, useRef } from "react";
import "./style.module.css";

export default function ImageTrailEffect() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const maxImages = 21;
        const images = [
            "/demos/imageTrailEffect/IMG_4488.jpg",
            "/demos/imageTrailEffect/IMG_4489.jpg",
            "/demos/imageTrailEffect/IMG_4490.jpg",
            "/demos/imageTrailEffect/IMG_4491.jpg",
            "/demos/imageTrailEffect/IMG_4492.jpg",
            "/demos/imageTrailEffect/IMG_4493.jpg",
            "/demos/imageTrailEffect/IMG_4494.jpg",
            "/demos/imageTrailEffect/IMG_4495.jpg",
            "/demos/imageTrailEffect/IMG_4496.jpg",
            "/demos/imageTrailEffect/IMG_4613.jpg",
            "/demos/imageTrailEffect/IMG_4614.jpg",
            "/demos/imageTrailEffect/IMG_4615.jpg",
            "/demos/imageTrailEffect/IMG_4616.jpg",
            "/demos/imageTrailEffect/IMG_4617.jpg",
            "/demos/imageTrailEffect/IMG_4618.jpg",
            "/demos/imageTrailEffect/IMG_4619.jpg",
            "/demos/imageTrailEffect/IMG_4620.jpg",
            "/demos/imageTrailEffect/IMG_4621.jpg",
            "/demos/imageTrailEffect/IMG_4622.jpg",
            "/demos/imageTrailEffect/IMG_4623.jpg",
            "/demos/imageTrailEffect/IMG_4624.jpg",
        ];

        // Mouse tracking
        const mouse = { x: 0, y: 0 };
        const prevMouse = { x: 0, y: 0 };
        let currentImage = 0;
        let zIndexCounter = 10; // Start at 10 and increment for proper layering

        // Pool of image elements (similar to meshes array in ripple shader)
        const imagePool = [];

        // Create pool of image elements
        for (let i = 0; i < maxImages; i++) {
            const imgWrapper = document.createElement("div");
            imgWrapper.className = "trail-image";

            const randomImage = images[Math.floor(Math.random() * images.length)];
            imgWrapper.style.backgroundImage = `url(${randomImage})`;

            // Randomly assign height between 180px and 220px for variety (keeping width at 150px)
            const randomHeight = Math.floor(Math.random() * (220 - 180 + 1)) + 180;
            imgWrapper.style.height = `${randomHeight}px`;

            imgWrapper.dataset.visible = "false";
            imgWrapper.dataset.opacity = "0";
            imgWrapper.dataset.scale = "1";
            imgWrapper.dataset.frameCount = "0"; // Track frames alive for delay

            container.appendChild(imgWrapper);
            imagePool.push(imgWrapper);
        }

        const moveMouse = (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        };

        window.addEventListener("mousemove", moveMouse);

        // Similar to setNewWave function
        const setNewImage = (x, y, index) => {
            const img = imagePool[index];
            img.dataset.visible = "true";
            img.dataset.opacity = "1"; // Reset opacity
            img.dataset.scale = "1"; // Reset scale
            img.dataset.frameCount = "0"; // Reset frame counter
            img.style.left = `${x}px`;
            img.style.top = `${y}px`;

            // Increment z-index so newer images always appear on top
            zIndexCounter++;
            img.style.zIndex = zIndexCounter.toString();

            // Change image randomly when creating new trail
            const randomImage = images[Math.floor(Math.random() * images.length)];
            img.style.backgroundImage = `url(${randomImage})`;
        };

        // Similar to trackMousePos function
        const trackMousePos = () => {
            // Only create new image if mouse moved more than 12px (Manhattan distance)
            if (
                Math.abs(mouse.x - prevMouse.x) < 8 &&
                Math.abs(mouse.y - prevMouse.y) < 8
            ) {
                // Mouse hasn't moved enough, don't create new image
            } else {
                setNewImage(mouse.x, mouse.y, currentImage);
                currentImage = (currentImage + 1) % maxImages; // Circular buffer
            }

            // Update prevMouse for next frame comparison
            prevMouse.x = mouse.x;
            prevMouse.y = mouse.y;
        };

        // Animation loop (similar to animate function)
        const animate = () => {
            trackMousePos();

            imagePool.forEach((img) => {
                if (img.dataset.visible === "true") {
                    let opacity = parseFloat(img.dataset.opacity);
                    let scale = parseFloat(img.dataset.scale);
                    let frameCount = parseInt(img.dataset.frameCount);

                    // Increment frame counter
                    frameCount++;
                    img.dataset.frameCount = frameCount.toString();

                    // Delay before starting fade (50 frames ≈ 0.83 seconds at 60fps)
                    const fadeDelay = 50;

                    if (frameCount > fadeDelay) {
                        // Only start fading after delay
                        opacity *= 0.96;
                    }

                    // Easing scale - reduced from 0.1 to 0.02 for much subtler scaling
                    scale = 0.98 * scale + 0.02;

                    // Update dataset
                    img.dataset.opacity = opacity.toString();
                    img.dataset.scale = scale.toString();

                    // Apply transforms (no rotation to prevent shake)
                    img.style.transform = `translate(-50%, -50%) scale(${scale})`;
                    img.style.opacity = opacity.toString();

                    // Hide when opacity is too low (if (mesh.material.opacity < 0.02))
                    if (opacity < 0.02) {
                        img.dataset.visible = "false";
                        img.style.opacity = "0";
                    }
                }
            });

            requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener("mousemove", moveMouse);
            imagePool.forEach((img) => {
                if (img.parentNode) {
                    container.removeChild(img);
                }
            });
        };
    }, []);

    return (
        <div className="image-hover-trail-container">
            <div ref={containerRef} className="trail-container"></div>
        </div>
    );
}

