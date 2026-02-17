'use client';

import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Flip } from 'gsap/Flip';
import './infinite-draggable-grid.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(useGSAP, Flip);
}

/**
 * InfiniteDraggableGrid Component
 * Infinite draggable grid with scroll and drag interactions.
 * Creates a seamless brick pattern that wraps infinitely in all directions.
 *
 * @param {string} [className=''] - Additional CSS classes
 * @param {Array} [images] - Array of image objects with src, alt, and optionally label/value
 * @param {boolean} [drag=true] - Enable drag interaction
 * @param {boolean} [scroll=true] - Enable scroll/wheel interaction
 * @param {number} [ease=0.06] - Lerp ease factor for smooth scrolling
 * @param {number} [speed=1] - Speed multiplier (alias for speedFactor * 0.4)
 * @param {number} [scaleDuration=0.3] - Duration of scale animation on drag
 * @param {string} [scaleEase='expo.out'] - Easing for scale animation
 * @param {boolean} [detail=true] - Enable detail view on click (disabled when onItemClick provided)
 * @param {number} [detailDuration=1] - Duration of detail view animation
 * @param {string} [detailEase='expo.inOut'] - Easing for detail view animation
 * @param {function} [onItemClick] - Callback when item is clicked (receives item data)
 * @param {boolean} [showLabel=false] - Show label overlay on each item
 */
export default function InfiniteDraggableGrid({
    className = '',
    images = [
        { src: '/demos/img1.png', alt: 'Image 1' },
        { src: '/demos/img2.png', alt: 'Image 2' },
        { src: '/demos/img3.png', alt: 'Image 3' },
        { src: '/demos/img4.png', alt: 'Image 4' },
        { src: '/demos/img5.jpg', alt: 'Image 5' },
        { src: '/demos/img6.jpg', alt: 'Image 6' },
    ],
    drag = true,
    scroll = true,
    ease = 0.06,
    speed = 1,
    scaleDuration = 0.3,
    scaleEase = 'expo.out',
    detail = true,
    detailDuration = 1,
    detailEase = 'expo.inOut',
    onItemClick = null,
    showLabel = false,
}) {
    const containerRef = useRef(null);
    const wrapperRef = useRef(null);
    const fullscreenRef = useRef(null);
    const itemsRef = useRef([]);
    const rafRef = useRef(null);

    // Calculate speedFactor from speed prop (matching original behavior)
    const speedFactor = 0.4 * speed;

    // Scroll state with lerp
    const scrollRef = useRef({
        current: { x: 0, y: 0 },
        target: { x: 0, y: 0 },
    });

    // Drag state
    const dragRef = useRef({
        isDragging: false,
        startX: 0,
        startY: 0,
        scrollX: 0,
        scrollY: 0,
    });

    // Detail view state
    const detailStateRef = useRef({
        isDetailView: false,
        isRenderPaused: false,
        isAnimating: false,
        currentDetailItem: null,
        activeTimeline: null,
        clickStartX: 0,
        clickStartY: 0,
    });

    // Determine if detail view should be enabled (disabled when onItemClick is provided)
    const enableDetailView = detail && !onItemClick;

    // Window dimensions
    const winRef = useRef({ w: 0, h: 0 });

    // Layout configuration for seamless brick pattern
    const layout = useRef({
        cardW: 250,        // Width of each card/image in pixels
        cardH: 200,        // Height of each card/image in pixels
        gapX: 200,         // Horizontal spacing between cards (left-to-right gap)
        gapY: 150,         // Vertical spacing between rows (top-to-bottom gap)
        cols: 6,           // Number of columns in the grid pattern
        rowCount: 6,       // Number of rows in the repeating tile pattern
        offsetX: 132,      // Horizontal offset for alternating rows (creates brick pattern)
        tileW: 0,          // Calculated total width of one tile (auto-computed)
        tileH: 0,          // Calculated total height of one tile (auto-computed)
    });

    // Calculate positions programmatically
    const calculatePositions = useCallback((sourceImages) => {
        const l = layout.current;
        const positions = [];
        let sourceIndex = 0;

        for (let row = 0; row < l.rowCount; row++) {
            const isOffsetRow = row % 2 === 0;
            const rowOffsetX = isOffsetRow ? l.offsetX : 0;
            const yPos = row * (l.cardH + l.gapY);

            for (let col = 0; col < l.cols; col++) {
                const xPos = rowOffsetX + col * (l.cardW + l.gapX);
                positions.push({
                    x: xPos,
                    y: yPos,
                    w: l.cardW,
                    h: l.cardH,
                    src: sourceImages[sourceIndex % sourceImages.length],
                    extraX: 0,
                    extraY: 0,
                });
                sourceIndex++;
            }
        }

        return positions;
    }, []);

    // Scale animation ref for continuous scaling while dragging
    const scaleAnimationRef = useRef(null);

    // Canvas zoom - scales entire wrapper to simulate moving closer to camera
    const startCanvasZoom = useCallback(() => {
        if (scaleAnimationRef.current) {
            scaleAnimationRef.current.kill();
        }
        if (wrapperRef.current) {
            scaleAnimationRef.current = gsap.to(wrapperRef.current, {
                scale: 1.08,
                duration: 2,
                ease: 'power2.out',
                overwrite: true,
            });
        }
    }, []);

    const stopCanvasZoom = useCallback(() => {
        if (scaleAnimationRef.current) {
            scaleAnimationRef.current.kill();
        }
        if (wrapperRef.current) {
            gsap.to(wrapperRef.current, {
                scale: 1,
                duration: 1.2,
                ease: scaleEase,
                overwrite: true,
            });
        }
    }, [scaleEase]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (!containerRef.current || !wrapperRef.current) return;

        const container = containerRef.current;
        const wrapper = wrapperRef.current;
        const l = layout.current;
        const ds = detailStateRef.current;

        // Calculate tile dimensions
        l.tileW = l.cols * (l.cardW + l.gapX);
        l.tileH = l.rowCount * (l.cardH + l.gapY);

        // Initialize window dimensions
        winRef.current.w = window.innerWidth;
        winRef.current.h = window.innerHeight;

        // Calculate item positions
        const itemData = calculatePositions(images);

        // Store items data
        itemsRef.current = itemData.map((data, index) => {
            const el = wrapper.children[index];
            const img = el?.querySelector('img, video');
            return {
                el,
                img,
                x: data.x,
                y: data.y,
                w: data.w,
                h: data.h,
                extraX: 0,
                extraY: 0,
            };
        });

        // Initial scroll offset
        scrollRef.current.current.x = scrollRef.current.target.x = -winRef.current.w * 0.1;
        scrollRef.current.current.y = scrollRef.current.target.y = -winRef.current.h * 0.1;

        // Event handlers
        const onWheel = (e) => {
            if (!scroll || ds.isDetailView) return;
            e.preventDefault();
            scrollRef.current.target.x -= e.deltaX * speedFactor;
            scrollRef.current.target.y -= e.deltaY * speedFactor;
        };

        const onMouseDown = (e) => {
            if (!drag || ds.isDetailView) return;
            // Don't start drag if clicking on an item with detail view or onItemClick enabled
            if ((enableDetailView || onItemClick) && e.target.closest('.infinite_draggable_grid_item')) {
                ds.clickStartX = e.clientX;
                ds.clickStartY = e.clientY;
                return;
            }
            e.preventDefault();
            dragRef.current.isDragging = true;
            wrapper.classList.add('is-dragging');
            dragRef.current.startX = e.clientX;
            dragRef.current.startY = e.clientY;
            dragRef.current.scrollX = scrollRef.current.target.x;
            dragRef.current.scrollY = scrollRef.current.target.y;
            startCanvasZoom();
        };

        const onMouseUp = () => {
            if (!dragRef.current.isDragging) return;
            dragRef.current.isDragging = false;
            wrapper.classList.remove('is-dragging');
            stopCanvasZoom();
        };

        const onMouseMove = (e) => {
            if (dragRef.current.isDragging) {
                scrollRef.current.target.x = dragRef.current.scrollX + (e.clientX - dragRef.current.startX);
                scrollRef.current.target.y = dragRef.current.scrollY + (e.clientY - dragRef.current.startY);
            }
        };

        const onTouchStart = (e) => {
            if (!drag || ds.isDetailView) return;
            // Don't start drag if tapping on an item with detail view or onItemClick enabled
            if ((enableDetailView || onItemClick) && e.target.closest('.infinite_draggable_grid_item')) {
                ds.clickStartX = e.touches[0].clientX;
                ds.clickStartY = e.touches[0].clientY;
                return;
            }
            dragRef.current.isDragging = true;
            wrapper.classList.add('is-dragging');
            dragRef.current.startX = e.touches[0].clientX;
            dragRef.current.startY = e.touches[0].clientY;
            dragRef.current.scrollX = scrollRef.current.target.x;
            dragRef.current.scrollY = scrollRef.current.target.y;
            startCanvasZoom();
        };

        const onTouchMove = (e) => {
            if (!dragRef.current.isDragging) return;
            e.preventDefault();
            scrollRef.current.target.x = dragRef.current.scrollX + (e.touches[0].clientX - dragRef.current.startX);
            scrollRef.current.target.y = dragRef.current.scrollY + (e.touches[0].clientY - dragRef.current.startY);
        };

        const onTouchEnd = () => {
            if (!dragRef.current.isDragging) return;
            dragRef.current.isDragging = false;
            wrapper.classList.remove('is-dragging');
            stopCanvasZoom();
        };

        const onResize = () => {
            winRef.current.w = window.innerWidth;
            winRef.current.h = window.innerHeight;
        };

        // Render loop
        const render = () => {
            if (ds.isRenderPaused) {
                rafRef.current = requestAnimationFrame(render);
                return;
            }

            const s = scrollRef.current;
            const win = winRef.current;
            const tileW = l.tileW;
            const tileH = l.tileH;

            // Lerp scroll
            s.current.x += (s.target.x - s.current.x) * ease;
            s.current.y += (s.target.y - s.current.y) * ease;

            itemsRef.current.forEach((item) => {
                if (!item.el) return;

                // Position with scroll and extra offset
                let posX = item.x + s.current.x + item.extraX;
                let posY = item.y + s.current.y + item.extraY;

                // Infinite wrapping
                while (posX + item.w < 0) {
                    item.extraX += tileW;
                    posX += tileW;
                }
                while (posX > win.w) {
                    item.extraX -= tileW;
                    posX -= tileW;
                }

                while (posY + item.h < 0) {
                    item.extraY += tileH;
                    posY += tileH;
                }
                while (posY > win.h) {
                    item.extraY -= tileH;
                    posY -= tileH;
                }

                item.el.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
            });

            rafRef.current = requestAnimationFrame(render);
        };

        // ============================================
        // CUSTOM ITEM CLICK HANDLER (when onItemClick provided)
        // ============================================
        if (onItemClick && !enableDetailView) {
            const CLICK_THRESHOLD = 5;

            itemsRef.current.forEach((item, index) => {
                const handleItemMouseDown = (e) => {
                    ds.clickStartX = e.clientX;
                    ds.clickStartY = e.clientY;
                };

                const handleItemClick = (e) => {
                    const deltaX = Math.abs(e.clientX - ds.clickStartX);
                    const deltaY = Math.abs(e.clientY - ds.clickStartY);

                    if (deltaX < CLICK_THRESHOLD && deltaY < CLICK_THRESHOLD) {
                        const imageData = images[index % images.length];
                        onItemClick(imageData, index);
                    }
                };

                item.el.addEventListener('mousedown', handleItemMouseDown);
                item.el.addEventListener('click', handleItemClick);

                // Store handlers for cleanup
                item._mousedownHandler = handleItemMouseDown;
                item._clickHandler = handleItemClick;
            });
        }

        // ============================================
        // DETAIL VIEW (Flip Animation on Click)
        // ============================================
        let fullscreenEl = null;

        if (enableDetailView) {
            // Create fullscreen container
            fullscreenEl = document.createElement('div');
            fullscreenEl.className = 'infinite_draggable_grid_fullscreen';
            fullscreenEl.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 100;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
      `;
            container.appendChild(fullscreenEl);
            fullscreenRef.current = fullscreenEl;

            // Create buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'infinite_draggable_grid_buttons';
            buttonsContainer.style.cssText = `
        position: fixed;
        bottom: 40px;
        left: 40px;
        z-index: 101;
        display: flex;
        gap: 8px;
        pointer-events: auto;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;

            // Create SHOW CODE button
            // const showCodeBtn = document.createElement('button');
            // showCodeBtn.style.cssText = `
            //     font-size: 12px;
            //     text-transform: uppercase;
            //     background: none;
            //     border: none;
            //     color: black;
            //     padding: 0;
            //     cursor: pointer;
            //     position: relative;
            //   `;

            // const showCodeText = document.createElement('span');
            // showCodeText.textContent = 'SHOW CODE';
            // showCodeBtn.appendChild(showCodeText);

            // const showCodeUnderline = document.createElement('span');
            // showCodeUnderline.style.cssText = `
            //     position: absolute;
            //     left: 0;
            //     bottom: -2px;
            //     height: 1px;
            //     background-color: currentColor;
            //     width: 100%;
            //     transform: scaleX(0);
            //     transform-origin: right;
            //     transition: transform 0.5s ease-in-out;
            //   `;
            // showCodeBtn.appendChild(showCodeUnderline);

            // showCodeBtn.onmouseenter = () => {
            //     showCodeUnderline.style.transform = 'scaleX(1)';
            //     showCodeUnderline.style.transformOrigin = 'left';
            // };
            // showCodeBtn.onmouseleave = () => {
            //     showCodeUnderline.style.transform = 'scaleX(0)';
            //     showCodeUnderline.style.transformOrigin = 'right';
            // };
            // showCodeBtn.onclick = (e) => {
            //     e.stopPropagation();
            //     // TODO: Implement show code functionality
            // };

            // Create VIEW IN FULL button
            const viewFullBtn = document.createElement('button');
            viewFullBtn.style.cssText = `
        font-size: 12px;
        text-transform: uppercase;
        background: none;
        border: none;
        color: black;
        padding: 0;
        cursor: pointer;
        position: relative;
      `;

            const viewFullText = document.createElement('span');
            viewFullText.textContent = 'LIVE DEMO';
            viewFullBtn.appendChild(viewFullText);

            const arrowIcon = document.createElement('span');
            arrowIcon.innerHTML = '&#8599;';
            arrowIcon.style.cssText = `
        margin-left: 4px;
        font-size: 14px;
      `;
            viewFullBtn.appendChild(arrowIcon);

            const viewFullUnderline = document.createElement('span');
            viewFullUnderline.style.cssText = `
        position: absolute;
        left: 0;
        bottom: 0px;
        height: 1px;
        background-color: currentColor;
        width: 100%;
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.5s ease-in-out;
      `;
            viewFullBtn.appendChild(viewFullUnderline);

            viewFullBtn.onmouseenter = () => {
                viewFullUnderline.style.transform = 'scaleX(1)';
                viewFullUnderline.style.transformOrigin = 'left';
            };
            viewFullBtn.onmouseleave = () => {
                viewFullUnderline.style.transform = 'scaleX(0)';
                viewFullUnderline.style.transformOrigin = 'right';
            };
            viewFullBtn.onclick = (e) => {
                e.stopPropagation();
                // Navigate to demo page - will be set when detail view opens
            };

            // buttonsContainer.appendChild(showCodeBtn);
            buttonsContainer.appendChild(viewFullBtn);
            container.appendChild(buttonsContainer);

            // Store reference for showing/hiding
            fullscreenEl._buttonsContainer = buttonsContainer;

            // Get visible items (within viewport)
            const getVisibleItems = () => {
                return itemsRef.current.filter((item) => {
                    const posX = item.x + scrollRef.current.current.x + item.extraX;
                    const posY = item.y + scrollRef.current.current.y + item.extraY;
                    return posX > -item.w && posX < winRef.current.w && posY > -item.h && posY < winRef.current.h;
                });
            };

            // Determine position relative to clicked item
            const getDirection = (itemRect, clickedRect) => {
                if (itemRect.bottom < clickedRect.top) return 'north';
                if (itemRect.top > clickedRect.bottom) return 'south';
                if (itemRect.right < clickedRect.left) return 'west';
                if (itemRect.left > clickedRect.right) return 'east';
                return null;
            };

            // Kill all running animations
            const killAnimations = () => {
                if (ds.activeTimeline) {
                    ds.activeTimeline.kill();
                    ds.activeTimeline = null;
                }
                itemsRef.current.forEach((item) => {
                    gsap.killTweensOf(item.el);
                    gsap.killTweensOf(item.img);
                });
                ds.isAnimating = false;
            };

            // Reset to closed state (immediate, no animation)
            const resetToClosedState = () => {
                killAnimations();

                if (ds.currentDetailItem) {
                    // Pause and reset video if it's a video element
                    if (ds.currentDetailItem.img.tagName === 'VIDEO') {
                        ds.currentDetailItem.img.pause();
                        ds.currentDetailItem.img.currentTime = 0;
                    }

                    if (ds.currentDetailItem.img.parentElement === fullscreenEl) {
                        ds.currentDetailItem.el.appendChild(ds.currentDetailItem.img);
                    }
                    // Reset style based on element type
                    if (ds.currentDetailItem.img.tagName === 'VIDEO') {
                        ds.currentDetailItem.img.style.cssText = 'width:100%;height:auto;object-fit:cover;';
                        // Remove fullscreen flag to restore hover behavior
                        delete ds.currentDetailItem.img.dataset.fullscreen;
                    } else {
                        ds.currentDetailItem.img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
                    }
                    gsap.set(ds.currentDetailItem.el, { zIndex: 'auto', clearProps: 'zIndex' });
                }

                // Sync scroll state
                scrollRef.current.current.x = scrollRef.current.target.x;
                scrollRef.current.current.y = scrollRef.current.target.y;

                // Clear GSAP transforms
                itemsRef.current.forEach((item) => {
                    gsap.set(item.el, { clearProps: 'x,y,rotation,transform' });
                    delete item._originalX;
                    delete item._originalY;
                    delete item._pushRotation;
                });

                ds.isDetailView = false;
                ds.isRenderPaused = false;
                ds.currentDetailItem = null;
                fullscreenEl.style.pointerEvents = 'none';
                container.classList.remove('is-detail-view');

                // Hide buttons
                if (fullscreenEl._buttonsContainer) {
                    fullscreenEl._buttonsContainer.style.opacity = '0';
                }
            };

            // Open detail view
            const openDetailView = (clickedItem, itemIndex) => {
                if (ds.isDetailView || ds.isAnimating) return;

                // Don't open detail view if there's no img/video element (e.g., placeholder items)
                if (!clickedItem.img) return;

                ds.isAnimating = true;
                ds.isDetailView = true;
                ds.isRenderPaused = true;
                ds.currentDetailItem = clickedItem;

                // Get the image data for navigation
                const imageData = images[itemIndex % images.length];

                // Set up VIEW IN FULL button navigation
                if (viewFullBtn && imageData.value) {
                    viewFullBtn.onclick = (e) => {
                        e.stopPropagation();
                        window.location.href = `/lab/${imageData.value}`;
                    };
                }

                const clickedRect = clickedItem.el.getBoundingClientRect();

                ds.activeTimeline = gsap.timeline({
                    onComplete: () => {
                        ds.isAnimating = false;
                        ds.activeTimeline = null;
                    },
                });

                gsap.set(clickedItem.el, { zIndex: 99 });

                const clickedState = Flip.getState(clickedItem.img, { props: '' });

                fullscreenEl.appendChild(clickedItem.img);
                clickedItem.img.style.cssText = `
          width: auto;
          height: 80vh;
          max-width: 90vw;
          object-fit: cover;
        `;

                // Mark video as in fullscreen to prevent hover handlers from pausing
                if (clickedItem.img.tagName === 'VIDEO') {
                    clickedItem.img.dataset.fullscreen = 'true';
                }

                const flipTween = Flip.from(clickedState, {
                    duration: detailDuration,
                    ease: detailEase,
                    absolute: true,
                    onComplete: () => {
                        // Play video if it's a video element
                        if (clickedItem.img.tagName === 'VIDEO') {
                            clickedItem.img.play();
                        }
                    },
                });
                ds.activeTimeline.add(flipTween, 0);

                const visibleItems = getVisibleItems().filter((item) => item !== clickedItem);

                visibleItems.forEach((item) => {
                    const itemRect = item.el.getBoundingClientRect();
                    const direction = getDirection(itemRect, clickedRect);

                    if (direction) {
                        let pushX = 0;
                        let pushY = 0;
                        const pushDistance = Math.max(winRef.current.w, winRef.current.h) * 0.8;

                        switch (direction) {
                            case 'north':
                                pushY = -pushDistance;
                                break;
                            case 'south':
                                pushY = pushDistance;
                                break;
                            case 'west':
                                pushX = -pushDistance;
                                break;
                            case 'east':
                                pushX = pushDistance;
                                break;
                        }

                        const currentX = item.x + scrollRef.current.current.x + item.extraX;
                        const currentY = item.y + scrollRef.current.current.y + item.extraY;

                        item._originalX = currentX;
                        item._originalY = currentY;

                        const targetX = currentX + pushX;
                        const targetY = currentY + pushY;
                        const rotation = gsap.utils.random(-40, 40);

                        item._pushRotation = rotation;

                        ds.activeTimeline.fromTo(
                            item.el,
                            { x: currentX, y: currentY, rotation: 0 },
                            {
                                x: targetX,
                                y: targetY,
                                rotation: rotation,
                                duration: detailDuration,
                                ease: detailEase,
                            },
                            0
                        );
                    }
                });

                fullscreenEl.style.pointerEvents = 'auto';
                container.classList.add('is-detail-view');

                // Show buttons
                if (fullscreenEl._buttonsContainer) {
                    fullscreenEl._buttonsContainer.style.opacity = '1';
                }
            };

            // Close detail view
            const closeDetailView = () => {
                if (!ds.isDetailView) return;

                if (ds.isAnimating) {
                    resetToClosedState();
                    return;
                }

                if (!ds.currentDetailItem) {
                    resetToClosedState();
                    return;
                }

                ds.isAnimating = true;
                const clickedItem = ds.currentDetailItem;

                // Pause and reset video if it's a video element
                if (clickedItem.img.tagName === 'VIDEO') {
                    clickedItem.img.pause();
                    clickedItem.img.currentTime = 0;
                }

                ds.activeTimeline = gsap.timeline({
                    onComplete: () => {
                        scrollRef.current.current.x = scrollRef.current.target.x;
                        scrollRef.current.current.y = scrollRef.current.target.y;

                        itemsRef.current.forEach((item) => {
                            gsap.set(item.el, { clearProps: 'x,y,rotation,transform' });
                        });

                        gsap.set(clickedItem.el, { zIndex: 'auto', clearProps: 'zIndex' });
                        ds.isDetailView = false;
                        ds.isRenderPaused = false;
                        ds.currentDetailItem = null;
                        ds.isAnimating = false;
                        ds.activeTimeline = null;
                    },
                });

                const clickedState = Flip.getState(clickedItem.img, { props: '' });

                clickedItem.el.appendChild(clickedItem.img);
                // Reset style based on element type
                if (clickedItem.img.tagName === 'VIDEO') {
                    clickedItem.img.style.cssText = 'width:100%;height:auto;object-fit:cover;';
                    // Remove fullscreen flag to restore hover behavior
                    delete clickedItem.img.dataset.fullscreen;
                } else {
                    clickedItem.img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
                }

                const flipTween = Flip.from(clickedState, {
                    duration: detailDuration,
                    ease: detailEase,
                    absolute: true,
                });
                ds.activeTimeline.add(flipTween, 0);

                itemsRef.current.forEach((item) => {
                    if (item._originalX !== undefined) {
                        const expectedX = item.x + scrollRef.current.target.x + item.extraX;
                        const expectedY = item.y + scrollRef.current.target.y + item.extraY;

                        ds.activeTimeline.to(
                            item.el,
                            {
                                x: expectedX,
                                y: expectedY,
                                rotation: 0,
                                duration: detailDuration,
                                ease: detailEase,
                                onComplete: () => {
                                    delete item._originalX;
                                    delete item._originalY;
                                    delete item._pushRotation;
                                },
                            },
                            0
                        );
                    }
                });

                fullscreenEl.style.pointerEvents = 'none';
                container.classList.remove('is-detail-view');

                // Hide buttons
                if (fullscreenEl._buttonsContainer) {
                    fullscreenEl._buttonsContainer.style.opacity = '0';
                }
            };

            const CLICK_THRESHOLD = 5;

            // Add click handlers to each item
            itemsRef.current.forEach((item, index) => {
                const handleItemMouseDown = (e) => {
                    ds.clickStartX = e.clientX;
                    ds.clickStartY = e.clientY;
                };

                const handleItemClick = (e) => {
                    const deltaX = Math.abs(e.clientX - ds.clickStartX);
                    const deltaY = Math.abs(e.clientY - ds.clickStartY);

                    if (deltaX < CLICK_THRESHOLD && deltaY < CLICK_THRESHOLD) {
                        if (ds.isDetailView) {
                            closeDetailView();
                        } else {
                            openDetailView(item, index);
                        }
                    }
                };

                item.el.addEventListener('mousedown', handleItemMouseDown);
                item.el.addEventListener('click', handleItemClick);

                // Store handlers for cleanup
                item._mousedownHandler = handleItemMouseDown;
                item._clickHandler = handleItemClick;
            });

            // Close on fullscreen click
            const handleFullscreenClick = (e) => {
                if (e.target === fullscreenEl || e.target === ds.currentDetailItem?.img) {
                    closeDetailView();
                }
            };
            fullscreenEl.addEventListener('click', handleFullscreenClick);

            // Close on escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape' && ds.isDetailView) {
                    closeDetailView();
                }
            };
            document.addEventListener('keydown', handleEscape);

            // Store for cleanup
            fullscreenEl._fullscreenClickHandler = handleFullscreenClick;
            fullscreenEl._escapeHandler = handleEscape;
        }

        // Add event listeners
        wrapper.addEventListener('wheel', onWheel, { passive: false });
        wrapper.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);
        wrapper.addEventListener('touchstart', onTouchStart, { passive: true });
        wrapper.addEventListener('touchmove', onTouchMove, { passive: false });
        wrapper.addEventListener('touchend', onTouchEnd);
        window.addEventListener('resize', onResize);

        // Start render loop
        render();

        // Cleanup
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            wrapper.removeEventListener('wheel', onWheel);
            wrapper.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
            wrapper.removeEventListener('touchstart', onTouchStart);
            wrapper.removeEventListener('touchmove', onTouchMove);
            wrapper.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('resize', onResize);

            // Kill GSAP tweens
            itemsRef.current.forEach((item) => {
                if (item?.img) {
                    gsap.killTweensOf(item.img);
                }
                if (item?.el) {
                    gsap.killTweensOf(item.el);
                    // Remove detail view handlers
                    if (item._mousedownHandler) {
                        item.el.removeEventListener('mousedown', item._mousedownHandler);
                    }
                    if (item._clickHandler) {
                        item.el.removeEventListener('click', item._clickHandler);
                    }
                }
            });

            // Clean up detail view
            if (fullscreenEl) {
                if (fullscreenEl._fullscreenClickHandler) {
                    fullscreenEl.removeEventListener('click', fullscreenEl._fullscreenClickHandler);
                }
                if (fullscreenEl._escapeHandler) {
                    document.removeEventListener('keydown', fullscreenEl._escapeHandler);
                }
                // Clean up buttons container
                if (fullscreenEl._buttonsContainer) {
                    fullscreenEl._buttonsContainer.remove();
                }
                fullscreenEl.remove();
            }
        };
    }, [images, drag, scroll, ease, speedFactor, startCanvasZoom, stopCanvasZoom, calculatePositions, detail, detailDuration, detailEase, enableDetailView, onItemClick]);

    // Calculate positions for initial render
    const itemPositions = calculatePositions(images);

    return (
        <div ref={containerRef} className={`infinite_draggable_grid_wrap ${className}`.trim()} data-anm-grid>
            <div ref={wrapperRef} className="infinite_draggable_grid_container" data-anm-grid-container>
                {itemPositions.map((pos, index) => {
                    const imageData = images[index % images.length];
                    return (
                        <div
                            key={index}
                            className="infinite_draggable_grid_item"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: `${pos.w}px`,
                                willChange: 'transform',
                            }}
                        >
                            {imageData.isPlaceholder ? (
                                <div
                                    className="infinite_draggable_grid_item_placeholder"
                                    data-anm-grid-image
                                    style={{
                                        width: '100%',
                                        aspectRatio: '4/3',
                                        backgroundColor: 'white',
                                        border: '1px solid black',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '20px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <div style={{
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        color: 'black',
                                        textTransform: 'uppercase',
                                    }}>
                                        {imageData.label}
                                    </div>
                                    <div style={{
                                        fontSize: '10px',
                                        color: 'black',
                                        textTransform: 'uppercase',
                                    }}>
                                        Coming Soon
                                    </div>
                                </div>
                            ) : imageData.isVideo ? (
                                <video
                                    src={imageData.src}
                                    className="infinite_draggable_grid_item_image"
                                    data-anm-grid-image
                                    loop
                                    muted
                                    playsInline
                                    onMouseEnter={(e) => {
                                        // Only play on hover if not in fullscreen mode
                                        if (!e.currentTarget.dataset.fullscreen) {
                                            e.currentTarget.play();
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        // Only pause/reset on hover out if not in fullscreen mode
                                        if (!e.currentTarget.dataset.fullscreen) {
                                            e.currentTarget.pause();
                                            e.currentTarget.currentTime = 0;
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                <img
                                    src={imageData.src}
                                    alt={imageData.alt}
                                    className="infinite_draggable_grid_item_image"
                                    data-anm-grid-image
                                    style={{
                                        aspectRatio: '4/3',
                                        objectFit: 'cover',
                                    }}
                                />
                            )}
                            {showLabel && imageData.label && (
                                <div className="infinite_draggable_grid_item_overlay">
                                    <span className="infinite_draggable_grid_item_label">
                                        {imageData.label}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
