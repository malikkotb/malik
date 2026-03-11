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
import GUI from 'lil-gui';

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

        // Camera - Perspective so Z-depth changes create visible foreshortening
        const fov = 45;
        let cameraZ = (sizes.height / 2) / Math.tan((fov / 2) * (Math.PI / 180));
        const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1, cameraZ * 3);
        camera.position.z = cameraZ;

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

        // Spacing between planes (85vw)
        let spacing = sizes.width * 0.5;

        // Content height for one full cycle
        let realContentHeight = IMAGES.length * spacing;

        // Texture loader
        const textureLoader = new THREE.TextureLoader();

        // Create planes for images (just enough to fill viewport + buffer)
        // We only need IMAGES.length planes and wrap them infinitely
        const planes = [];

        for (let i = 0; i < IMAGES.length; i++) {
            const texture = textureLoader.load(IMAGES[i]);
            texture.colorSpace = THREE.SRGBColorSpace;

            const geometry = new THREE.PlaneGeometry(planeSize, planeSize, 64, 64);
            const material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uTexture: { value: texture },
                    uPlaneHeight: { value: planeSize },
                    uScrollProgress: { value: 0.0 },
                    uCurlRadius: { value: planeSize * 0.3 },
                    uCurlMaxHeight: { value: 1.14 },
                },
                side: THREE.DoubleSide,
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData.index = i;

            scene.add(mesh);
            planes.push(mesh);
        }

        // Custom smooth scroll state
        // We use a virtual scroll position that can go infinitely
        // and use modulo to determine visual positions
        const scrollState = {
            current: 0,      // Current animated scroll position
            target: 0,       // Target scroll position (where we want to go)
            ease: 0.08,      // Lerp factor for smooth scrolling
        };

        // Debug GUI
        const params = {
            curlRadiusFactor: 0.3,    // multiplied by planeSize
            curlMaxHeight: 0.50,
            scrollEase: 0.08,
            planeSizeFactor: 0.35,    // multiplied by window width
        };

        const gui = new GUI({ title: 'Peeling Carousel' });
        gui.domElement.style.position = 'fixed';
        gui.domElement.style.bottom = '16px';
        gui.domElement.style.left = '16px';
        gui.domElement.style.top = 'auto';
        gui.domElement.style.right = 'auto';

        gui.add(params, 'curlRadiusFactor', 0.01, 0.5, 0.001).name('Curl Radius').onChange((v) => {
            planes.forEach((plane) => {
                plane.material.uniforms.uCurlRadius.value = planeSize * v;
            });
        });

        gui.add(params, 'curlMaxHeight', 0.0, 2.0, 0.01).name('Curl Max Height').onChange((v) => {
            planes.forEach((plane) => {
                plane.material.uniforms.uCurlMaxHeight.value = v;
            });
        });

        gui.add(params, 'scrollEase', 0.01, 0.5, 0.01).name('Scroll Ease').onChange((v) => {
            scrollState.ease = v;
        });

        gui.add(params, 'planeSizeFactor', 0.1, 0.9, 0.01).name('Plane Size').onChange((v) => {
            planeSize = sizes.width * v;
            planes.forEach((plane) => {
                plane.geometry.dispose();
                plane.geometry = new THREE.PlaneGeometry(planeSize, planeSize, 64, 64);
                plane.material.uniforms.uPlaneHeight.value = planeSize;
                plane.material.uniforms.uCurlRadius.value = planeSize * params.curlRadiusFactor;
            });
        });

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
            cameraZ = (sizes.height / 2) / Math.tan((fov / 2) * (Math.PI / 180));
            camera.aspect = sizes.width / sizes.height;
            camera.far = cameraZ * 3;
            camera.position.z = cameraZ;
            camera.updateProjectionMatrix();

            // Update renderer
            renderer.setSize(sizes.width, sizes.height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Update plane size and spacing
            planeSize = sizes.width * 0.35;
            spacing = sizes.width * 0.75;
            realContentHeight = IMAGES.length * spacing;

            planes.forEach((plane, index) => {
                plane.geometry.dispose();
                plane.geometry = new THREE.PlaneGeometry(planeSize, planeSize, 64, 64);
                plane.material.uniforms.uPlaneHeight.value = planeSize;
                plane.material.uniforms.uCurlRadius.value = planeSize * params.curlRadiusFactor;

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

            });

            renderer.dispose();
            gui.destroy();
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
