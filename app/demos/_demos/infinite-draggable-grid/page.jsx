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
 * @param {Array} [images] - Array of image objects with src and alt
 * @param {boolean} [drag=true] - Enable drag interaction
 * @param {boolean} [scroll=true] - Enable scroll/wheel interaction
 * @param {number} [ease=0.06] - Lerp ease factor for smooth scrolling
 * @param {number} [speed=1] - Speed multiplier (alias for speedFactor * 0.4)
 * @param {number} [scaleDuration=0.3] - Duration of scale animation on drag
 * @param {string} [scaleEase='expo.out'] - Easing for scale animation
 * @param {boolean} [detail=true] - Enable detail view on click
 * @param {number} [detailDuration=1] - Duration of detail view animation
 * @param {string} [detailEase='expo.inOut'] - Easing for detail view animation
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

    // Window dimensions
    const winRef = useRef({ w: 0, h: 0 });

    // Layout configuration for seamless brick pattern
    const layout = useRef({
        cardW: 240,
        cardH: 300, // 4:5 aspect ratio (240 * 5/4 = 300)
        gap: 132,
        cols: 6,
        rowCount: 6,
        offsetX: 132,
        tileW: 0,
        tileH: 0,
    });

    // Calculate positions programmatically
    const calculatePositions = useCallback((sourceImages) => {
        const l = layout.current;
        const positions = [];
        let sourceIndex = 0;

        for (let row = 0; row < l.rowCount; row++) {
            const isOffsetRow = row % 2 === 0;
            const rowOffsetX = isOffsetRow ? l.offsetX : 0;
            const yPos = row * (l.cardH + l.gap);

            for (let col = 0; col < l.cols; col++) {
                const xPos = rowOffsetX + col * (l.cardW + l.gap);
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

    // Scale animation helper
    const animateScale = useCallback((scale) => {
        itemsRef.current.forEach((item) => {
            if (item?.img) {
                gsap.to(item.img, {
                    scale,
                    duration: scaleDuration,
                    ease: scaleEase,
                    overwrite: true,
                });
            }
        });
    }, [scaleDuration, scaleEase]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (!containerRef.current || !wrapperRef.current) return;

        const container = containerRef.current;
        const wrapper = wrapperRef.current;
        const l = layout.current;
        const ds = detailStateRef.current;

        // Calculate tile dimensions
        l.tileW = l.cols * (l.cardW + l.gap);
        l.tileH = l.rowCount * (l.cardH + l.gap);

        // Initialize window dimensions
        winRef.current.w = window.innerWidth;
        winRef.current.h = window.innerHeight;

        // Calculate item positions
        const itemData = calculatePositions(images);

        // Store items data
        itemsRef.current = itemData.map((data, index) => {
            const el = wrapper.children[index];
            const img = el?.querySelector('img');
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
            // Don't start drag if clicking on an item with detail view enabled
            if (detail && e.target.closest('.infinite_draggable_grid_item')) {
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
            animateScale(0.95);
        };

        const onMouseUp = () => {
            if (!dragRef.current.isDragging) return;
            dragRef.current.isDragging = false;
            wrapper.classList.remove('is-dragging');
            animateScale(1);
        };

        const onMouseMove = (e) => {
            if (dragRef.current.isDragging) {
                scrollRef.current.target.x = dragRef.current.scrollX + (e.clientX - dragRef.current.startX);
                scrollRef.current.target.y = dragRef.current.scrollY + (e.clientY - dragRef.current.startY);
            }
        };

        const onTouchStart = (e) => {
            if (!drag || ds.isDetailView) return;
            // Don't start drag if tapping on an item with detail view enabled
            if (detail && e.target.closest('.infinite_draggable_grid_item')) {
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
            animateScale(0.95);
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
            animateScale(1);
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
        // DETAIL VIEW (Flip Animation on Click)
        // ============================================
        let fullscreenEl = null;

        if (detail) {
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
                    if (ds.currentDetailItem.img.parentElement === fullscreenEl) {
                        ds.currentDetailItem.el.appendChild(ds.currentDetailItem.img);
                    }
                    ds.currentDetailItem.img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
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
            };

            // Open detail view
            const openDetailView = (clickedItem) => {
                if (ds.isDetailView || ds.isAnimating) return;

                ds.isAnimating = true;
                ds.isDetailView = true;
                ds.isRenderPaused = true;
                ds.currentDetailItem = clickedItem;

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

                const flipTween = Flip.from(clickedState, {
                    duration: detailDuration,
                    ease: detailEase,
                    absolute: true,
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
                clickedItem.img.style.cssText = 'width:100%;height:100%;object-fit:cover;';

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
            };

            const CLICK_THRESHOLD = 5;

            // Add click handlers to each item
            itemsRef.current.forEach((item) => {
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
                            openDetailView(item);
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
                fullscreenEl.remove();
            }
        };
    }, [images, drag, scroll, ease, speedFactor, animateScale, calculatePositions, detail, detailDuration, detailEase]);

    // Calculate positions for initial render
    const itemPositions = calculatePositions(images);

    return (
        <div ref={containerRef} className={`infinite_draggable_grid_wrap ${className}`.trim()} data-anm-grid>
            <div ref={wrapperRef} className="infinite_draggable_grid_container" data-anm-grid-container>
                {itemPositions.map((pos, index) => (
                    <div
                        key={index}
                        className="infinite_draggable_grid_item"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            padding: '50px',
                            aspectRatio: '4/5',
                            width: `${pos.w}px`,
                            willChange: 'transform',
                        }}
                    >
                        <img
                            src={images[index % images.length].src}
                            alt={images[index % images.length].alt}
                            className="infinite_draggable_grid_item_image"
                            data-anm-grid-image
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
