'use client';

/**
 * PeelingImageCarousel
 *
 * Inspired by: https://designembraced.com/
 *
 * Infinite scroll with custom smooth scrolling (no Lenis).
 * We maintain full control over scroll state for seamless teleportation.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

const IMAGES = [
    '/demos/fancy_img1.webp',
    '/demos/fancy_img2.webp',
    '/demos/fancy_img3.webp',
    '/demos/fancy_img4.webp',
    '/demos/fancy_img5.webp',
    '/demos/fancy_img6.webp',
    '/demos/fancy_img7.webp',
];

export default function PeelingImageCarousel() {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !canvasRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#ffffff');

        // Sizes
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        // Camera - Orthographic for 2D layout
        const frustumSize = sizes.height;
        const aspect = sizes.width / sizes.height;
        const camera = new THREE.OrthographicCamera(
            (frustumSize * aspect) / -2,
            (frustumSize * aspect) / 2,
            frustumSize / 2,
            frustumSize / -2,
            0.1,
            1000
        );
        camera.position.z = 5;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: false,
        });
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Calculate plane size: 35vw in Three.js units
        let planeSize = sizes.width * 0.35;

        // Spacing between planes (100vh)
        let spacing = sizes.height;

        // Content height for one full cycle
        let realContentHeight = IMAGES.length * spacing;

        // Texture loader
        const textureLoader = new THREE.TextureLoader();

        // Create planes for images (just enough to fill viewport + buffer)
        // We only need IMAGES.length planes and wrap them infinitely
        const planes = [];
        const shadows = [];

        // Shadow material - soft black gradient
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.15,
        });

        for (let i = 0; i < IMAGES.length; i++) {
            const texture = textureLoader.load(IMAGES[i]);
            texture.colorSpace = THREE.SRGBColorSpace;

            const geometry = new THREE.PlaneGeometry(planeSize, planeSize, 1, 64);
            const material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uTexture: { value: texture },
                    uPlaneHeight: { value: planeSize },
                    uScrollProgress: { value: 0.0 },
                    uCurlRadius: { value: planeSize * 0.08 },
                    uCurlMaxHeight: { value: 0.35 },
                },
                side: THREE.DoubleSide,
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData.index = i;

            // Create shadow plane
            const shadowGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
            const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial.clone());
            shadow.position.z = -5; // Behind the image
            shadow.userData.index = i;

            scene.add(shadow);
            scene.add(mesh);
            planes.push(mesh);
            shadows.push(shadow);
        }

        // Custom smooth scroll state
        // We use a virtual scroll position that can go infinitely
        // and use modulo to determine visual positions
        const scrollState = {
            current: 0,      // Current animated scroll position
            target: 0,       // Target scroll position (where we want to go)
            ease: 0.08,      // Lerp factor for smooth scrolling
        };

        // Handle wheel events
        const handleWheel = (e) => {
            e.preventDefault();
            scrollState.target += e.deltaY;
        };

        // Handle touch events for mobile
        let touchStartY = 0;
        const handleTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e) => {
            e.preventDefault();
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;
            touchStartY = touchY;
            scrollState.target += deltaY * 2;
        };

        const container = containerRef.current;
        container.addEventListener('wheel', handleWheel, { passive: false });
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });

        // Handle resize
        const handleResize = () => {
            sizes.width = window.innerWidth;
            sizes.height = window.innerHeight;

            // Update camera
            const frustumSize = sizes.height;
            const aspect = sizes.width / sizes.height;
            camera.left = (frustumSize * aspect) / -2;
            camera.right = (frustumSize * aspect) / 2;
            camera.top = frustumSize / 2;
            camera.bottom = frustumSize / -2;
            camera.updateProjectionMatrix();

            // Update renderer
            renderer.setSize(sizes.width, sizes.height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Update plane size and spacing
            planeSize = sizes.width * 0.35;
            spacing = sizes.height;
            realContentHeight = IMAGES.length * spacing;

            planes.forEach((plane, index) => {
                plane.geometry.dispose();
                plane.geometry = new THREE.PlaneGeometry(planeSize, planeSize, 1, 64);
                plane.material.uniforms.uPlaneHeight.value = planeSize;
                plane.material.uniforms.uCurlRadius.value = planeSize * 0.08;

                // Update shadow geometry
                shadows[index].geometry.dispose();
                shadows[index].geometry = new THREE.PlaneGeometry(planeSize, planeSize);
            });
        };

        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
            // Smooth scroll with lerp
            scrollState.current += (scrollState.target - scrollState.current) * scrollState.ease;

            // Use modulo to get position within one cycle
            // This creates infinite scrolling without any teleportation needed
            let normalizedScroll = scrollState.current % realContentHeight;

            // Handle negative scroll (scrolling up)
            if (normalizedScroll < 0) {
                normalizedScroll += realContentHeight;
            }

            // Update plane positions
            // Each plane wraps around based on scroll position
            planes.forEach((plane, index) => {
                // Base position for this plane
                const baseY = -index * spacing;

                // Apply scroll offset
                let y = baseY + normalizedScroll;

                // Wrap planes to create infinite loop
                // If plane is too far above viewport, move it below
                // If plane is too far below viewport, move it above
                const halfViewport = sizes.height / 2;

                while (y > halfViewport + spacing) {
                    y -= realContentHeight;
                }
                while (y < -halfViewport - spacing) {
                    y += realContentHeight;
                }

                plane.position.y = y;

                // Update scroll progress uniform for curl effect
                const viewportHalfHeight = sizes.height / 2;
                const scrollProgress = Math.max(-1.5, Math.min(1.5, y / viewportHalfHeight));
                plane.material.uniforms.uScrollProgress.value = scrollProgress;

                // Update shadow position and opacity based on curl
                const shadow = shadows[index];
                shadow.position.y = y;
                shadow.position.x = plane.position.x;

                // Calculate curl amount (same logic as shader)
                let curlAmount = 0;
                if (scrollProgress < 0) {
                    curlAmount = Math.max(0, Math.min(1, (-scrollProgress - 0.2) / 0.8));
                } else if (scrollProgress > 0) {
                    curlAmount = Math.max(0, Math.min(1, (scrollProgress - 0.2) / 0.8));
                }

                // Shadow gets more visible and offset as curl increases
                shadow.material.opacity = curlAmount * 0.2;
                shadow.position.x = plane.position.x + curlAmount * planeSize * 0.05;
                shadow.position.y = y - curlAmount * planeSize * 0.03;
            });

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);

        // Cleanup
        return () => {
            container.removeEventListener('wheel', handleWheel);
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('resize', handleResize);

            planes.forEach((plane, index) => {
                plane.geometry.dispose();
                plane.material.uniforms.uTexture.value?.dispose();
                plane.material.dispose();
                scene.remove(plane);

                // Cleanup shadows
                shadows[index].geometry.dispose();
                shadows[index].material.dispose();
                scene.remove(shadows[index]);
            });

            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className='w-full h-full absolute top-0 left-0'
            style={{ cursor: 'grab', touchAction: 'none' }}
        >
            <canvas ref={canvasRef} />
        </div>
    );
}
