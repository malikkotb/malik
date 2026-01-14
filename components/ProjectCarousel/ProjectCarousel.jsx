"use client";
import { useRef, useState, useEffect, useMemo } from "react";
import projects from "@/app/carouselData";
import gsap from "gsap";

export default function ProjectCarousel() {
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [carouselHeight, setCarouselHeight] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const isPausedRef = useRef(false);
  const titleRefs = useRef(new Map());
  const linkRefs = useRef(new Map());

  // Calculate carousel height from viewport (60vh)
  useEffect(() => {
    const calculateHeight = () => {
      setCarouselHeight(window.innerHeight * 0.7);
    };

    // Set initial height
    calculateHeight();

    // Update on resize
    window.addEventListener("resize", calculateHeight);
    return () =>
      window.removeEventListener("resize", calculateHeight);
  }, []);

  // Create infinite loop by duplicating projects
  const duplicatedProjects = useMemo(
    () => [...projects, ...projects, ...projects],
    []
  );

  // Calculate dimensions for each project based on orientation
  const getProjectWidth = (orientation) => {
    const aspect = orientation === "vertical" ? 4 / 5 : 4 / 3;
    return carouselHeight * aspect;
  };

  // Calculate widths for all projects in a single set
  const projectWidths = useMemo(() => {
    return projects.map((project) =>
      getProjectWidth(project.orientation)
    );
  }, [carouselHeight]);

  // Calculate single set width (sum of all project widths + gaps)
  const singleSetWidth = useMemo(() => {
    return projectWidths.reduce((sum, width) => sum + width + 10, 0);
  }, [projectWidths]);

  // Handle mouse down for dragging - only when clicking on carousel
  const handleMouseDown = (e) => {
    // Only start dragging if clicking directly on the carousel container
    if (
      e.target === carouselRef.current ||
      carouselRef.current.contains(e.target)
    ) {
      setIsDragging(true);
      setStartX(e.pageX - carouselRef.current.offsetLeft);
      setScrollLeft(carouselRef.current.scrollLeft);
      carouselRef.current.style.cursor = "grabbing";
      e.preventDefault();
    }
  };

  // Handle mouse move for dragging - attach to document only when dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!carouselRef.current) return;
      e.preventDefault();
      const x = e.pageX - carouselRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      carouselRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (carouselRef.current) {
        carouselRef.current.style.cursor = "grab";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, startX, scrollLeft]);

  // Initialize scroll position to the middle set
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || carouselHeight === 0 || singleSetWidth === 0)
      return;

    // Start at the middle set (second copy)
    carousel.scrollLeft = singleSetWidth;
  }, [carouselHeight, singleSetWidth]);

  // Handle infinite scroll - reset position when reaching boundaries
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || singleSetWidth === 0) return;

    let rafId = null;
    let isAdjusting = false;

    const handleScroll = () => {
      if (isAdjusting) return;

      rafId = requestAnimationFrame(() => {
        const scrollLeft = carousel.scrollLeft;

        // If scrolled past the second set, jump back to the first set seamlessly
        if (scrollLeft >= singleSetWidth * 2 - 100) {
          isAdjusting = true;
          const offset = scrollLeft - singleSetWidth * 2;
          carousel.style.scrollBehavior = "auto";
          carousel.scrollLeft = singleSetWidth + offset;
          requestAnimationFrame(() => {
            carousel.style.scrollBehavior = "";
            isAdjusting = false;
          });
        }
        // If scrolled before the first set, jump to the second set
        else if (scrollLeft <= 100) {
          isAdjusting = true;
          carousel.style.scrollBehavior = "auto";
          carousel.scrollLeft = singleSetWidth + scrollLeft;
          requestAnimationFrame(() => {
            carousel.style.scrollBehavior = "";
            isAdjusting = false;
          });
        }
      });
    };

    carousel.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => {
      carousel.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [singleSetWidth]);

  // Handle mouse wheel for horizontal scrolling - only when over carousel
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleWheel = (e) => {
      const rect = carousel.getBoundingClientRect();
      const isOverCarousel =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isOverCarousel) {
        e.preventDefault();
        e.stopPropagation();
        carousel.scrollLeft += e.deltaY;
      }
    };

    // Add event listener with passive: false to allow preventDefault
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Update pause state
  useEffect(() => {
    isPausedRef.current = isDragging || hoveredIndex !== null;
  }, [isDragging, hoveredIndex]);

  // Initialize title and link elements with GSAP
  useEffect(() => {
    duplicatedProjects.forEach((project, index) => {
      const titleEl = titleRefs.current.get(index);
      const linkEl = linkRefs.current.get(index);

      if (titleEl) {
        gsap.set(titleEl, { opacity: 0, y: 20 });
      }
      if (linkEl) {
        gsap.set(linkEl, { opacity: 0, y: 20 });
      }
    });
  }, [duplicatedProjects, carouselHeight]);

  // Animate title and link on hover
  useEffect(() => {
    duplicatedProjects.forEach((project, index) => {
      const titleEl = titleRefs.current.get(index);
      const linkEl = linkRefs.current.get(index);
      const isHovered = hoveredIndex === index;

      if (titleEl) {
        if (isHovered) {
          gsap.to(titleEl, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        } else {
          gsap.to(titleEl, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      }

      if (linkEl) {
        if (isHovered) {
          gsap.to(linkEl, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        } else {
          gsap.to(linkEl, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      }
    });
  }, [hoveredIndex, duplicatedProjects]);

  // Auto-scroll the carousel slowly
  useEffect(() => {
    if (singleSetWidth === 0 || carouselHeight === 0) return;

    const scrollSpeed = 1; // pixels per interval (adjust for speed)

    const scrollInterval = setInterval(() => {
      const carousel = carouselRef.current;
      if (carousel && !isPausedRef.current) {
        carousel.scrollLeft += scrollSpeed;
      }
    }, 16); // ~60fps (16ms per frame)

    return () => {
      clearInterval(scrollInterval);
    };
  }, [singleSetWidth, carouselHeight]);

  // Calculate total width for the carousel
  const totalWidth = useMemo(() => {
    let width = 0;
    duplicatedProjects.forEach((project) => {
      width += getProjectWidth(project.orientation) + 10;
    });
    return width;
  }, [duplicatedProjects, carouselHeight]);

  return (
    <div className='fixed bottom-0 left-0 w-full overflow-hidden pointer-events-none'>
      <div
        ref={carouselRef}
        className='h-full w-full overflow-x-auto overflow-y-hidden cursor-grab pointer-events-auto'
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          height: `${carouselHeight}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          style={{
            width: `${totalWidth}px`,
            height: `${carouselHeight}px`,
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            gap: "10px",
            paddingLeft: "10px",
          }}
        >
          {duplicatedProjects.map((project, index) => {
            const projectWidth = getProjectWidth(project.orientation);
            const isHovered = hoveredIndex === index;

            // Calculate left position by summing widths of all previous projects
            let leftPosition = 10;
            for (let i = 0; i < index; i++) {
              leftPosition +=
                getProjectWidth(duplicatedProjects[i].orientation) +
                10;
            }

            // Adjust for top padding
            const topPadding = 10;

            const originalIndex = index % projects.length;
            const currentProject = projects[originalIndex];

            return (
              <a
                key={`project-${index}`}
                href={currentProject?.link}
                target='_blank'
                rel='noreferrer'
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className='transition-all duration-300 rounded overflow-hidden cursor-pointer'
                style={{
                  position: "absolute",
                  left: `${leftPosition}px`,
                  top: `${topPadding}px`,
                  width: `${projectWidth}px`,
                  height: `${carouselHeight - topPadding * 2}px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isHovered
                    ? "0 0 14px rgba(166, 166, 166, 0.1), 0 0 14px rgba(166, 166, 166, 0.15), 0 0 14px rgba(166, 166, 166, 0.08), 0 0 14px rgba(166, 166, 166, 0.03)"
                    : "none",
                  textDecoration: "none",
                }}
              >
                {project.videoSrc && (
                  <video
                    src={project.videoSrc}
                    className='w-full h-full object-cover'
                    loop
                    muted
                    playsInline
                    // autoPlay
                    preload='auto'
                  />
                )}

                {/* Title - Bottom Left */}
                <div
                  ref={(el) => {
                    if (el) titleRefs.current.set(index, el);
                    else titleRefs.current.delete(index);
                  }}
                  style={{
                    position: "absolute",
                    bottom: "28px",
                    left: "28px",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: 500,
                    pointerEvents: "none",
                  }}
                >
                  {currentProject?.title}
                </div>

                {/* Link - Bottom Right */}
                <div
                  ref={(el) => {
                    if (el) linkRefs.current.set(index, el);
                    else linkRefs.current.delete(index);
                  }}
                  style={{
                    position: "absolute",
                    bottom: "28px",
                    right: "28px",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: 500,
                    pointerEvents: "none",
                  }}
                  onMouseEnter={(e) => e.stopPropagation()}
                >
                  {currentProject?.link
                    ?.replace(/^https?:\/\/(www\.)?/i, "")
                    .replace(/\/$/, "")}
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
