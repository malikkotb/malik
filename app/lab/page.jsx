"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InfiniteDraggableGrid from "@/app/lab/_demos/infinite-draggable-grid/page";
// import LoadingScreen from "@/components/LoadingScreen";

const frameworks = [
  { value: "3d-image-universe", label: "3D Image Universe" },
  { value: "ripple-shader", label: "Ripple Shader" },
  { value: "zoom-carousel", label: "Zoom Carousel" },
  { value: "peeling-image-carousel", label: "Peeling Image Carousel" },
  { value: "infinite-scroll-bulge-horizontal", label: "Infinite Scroll Bulge Horizontal" },
  { value: "mouse-image-distorter", label: "Mouse Image Distorter" },
  // { value: "particle-distorter", label: "Particle Distorter" },
  { value: "threedwave", label: "3D Wave on Scroll" },
  { value: "tile-hover-distortion", label: "Tile Hover Distortion" },
  // { value: "infinite-draggable-grid", label: "Infinite Draggable Grid" },
  // { value: "particle-morphing-canvas", label: "Particle Morphing Canvas" },
  { value: "svgMaskScroll", label: "SVG Mask Scroll" },
  { value: "bulge-distortion-shader", label: "Bulge Distortion Shader" },
  { value: "textScrolly", label: "Text Scrolly" },
  { value: "imageTrailEffect", label: "Image Trail Effect" },
  { value: "pixelated-infinite-scroll", label: "Pixelated Infinite Scroll" },
  { value: "3d-dna-carousel", label: "3D DNA Carousel" },
  { value: "infinite-scroll-bulge-vertical", label: "Infinite Scroll Bulge Vertical" },
  { value: "infinity-scale-carousel", label: "Infinity Scale Carousel" },
  { value: "circular-infinite-carousel", label: "Circular Infinite Carousel" },
  { value: "snake-image-trail", label: "Snake Image Trail" },
  { value: "dark-cloud-ripple-shader", label: "Dark Cloud Ripple Shader" },
  { value: "magazine-carousel-shader", label: "Magazine Carousel Shader" },
  { value: "ascii-art", label: "ASCII Art" },
  { value: "text-distortion-shader", label: "Text Distortion Shader" },
  { value: "text-hover-distortion", label: "Text Hover Distortion" },
  { value: "smooth-parallax-scroll", label: "Smooth Parallax Scroll" },
  { value: "pretext", label: "Pretext" },
  // { value: "rubiks-cube", label: "Rubik's Cube" },
];

function SplitTextReveal({ text, className, style }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    const chars = el?.querySelectorAll(".split-char");
    if (!chars?.length) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      chars.forEach((c) => (c.style.opacity = "1"));
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const setup = () => {
      ScrollTrigger.refresh();

      const rect = el.getBoundingClientRect();
      const alreadyInView = rect.top < window.innerHeight * 0.9;

      gsap.fromTo(
        chars,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.2,
          stagger: 0.2 / chars.length,
          ease: "power2.out",
          ...(!alreadyInView && {
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
            },
          }),
        }
      );
    };

    // Wait for layout to settle before measuring positions
    const timeout = setTimeout(setup, 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <p ref={containerRef} className={className} style={style}>
      {text.split("").map((char, i) => (
        <span key={i} className="split-char inline-block" style={{ opacity: 0 }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </p>
  );
}

function DemoCard({ demo, onNavigate }) {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const isVisible = useRef(false);
  const [loadSrc, setLoadSrc] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // Preload observer — load src when nearby
    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadSrc(true);
          loadObserver.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    // Play/pause observer — exact viewport only
    const playObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        const video = videoRef.current;
        if (!video) return;
        if (entry.isIntersecting) {
          video.play().catch(() => { });
        } else {
          video.pause();
        }
      },
      { rootMargin: "0px" }
    );

    loadObserver.observe(el);
    playObserver.observe(el);
    return () => {
      loadObserver.disconnect();
      playObserver.disconnect();
    };
  }, []);

  const handleVideoReady = () => {
    if (isVisible.current) {
      videoRef.current?.play().catch(() => { });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onNavigate();
    }
  };

  return (
    <div
      ref={cardRef}
      className="w-full cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`View ${demo.label} demo`}
      onClick={onNavigate}
      onKeyDown={handleKeyDown}
    >
      {loadSrc ? (
        <video
          ref={videoRef}
          src={demo.src}
          muted
          loop
          playsInline
          preload="metadata"
          disableRemotePlayback
          disablePictureInPicture
          onCanPlay={handleVideoReady}
          className="w-full rounded-[4px] object-cover aspect-video"
        />
      ) : (
        <div className="w-full rounded-[4px] aspect-video" />
      )}
      <SplitTextReveal text={demo.label} className="mt-2" style={{ fontSize: "0.875rem" }} />
    </div>
  );
}

export default function DemosPage() {
  const router = useRouter();
  // Default to false (desktop) to avoid blank flash on SSR/hydration
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Video URL mapping for demos
  const videoUrls = {
    "3d-dna-carousel": "https://malik-portfolio.b-cdn.net/Lab/3d-dna-carousel.webm",
    "3d-image-universe": "https://malik-portfolio.b-cdn.net/Lab/3d-image-universe.webm",
    "bulge-distortion-shader": "https://malik-portfolio.b-cdn.net/Lab/bulge-distortion-shader.webm",
    "imageTrailEffect": "https://malik-portfolio.b-cdn.net/Lab/imageTrailEffect.webm",
    "mouse-image-distorter": "https://malik-portfolio.b-cdn.net/Lab/mouse-image-distorter.webm",
    "pixelated-infinite-scroll": "https://malik-portfolio.b-cdn.net/Lab/pixelated-infinite-scroll.webm",
    "ripple-shader": "https://malik-portfolio.b-cdn.net/Lab/ripple-shader.webm",
    "svgMaskScroll": "https://malik-portfolio.b-cdn.net/Lab/svgMaskScroll.webm",
    "textScrolly": "https://malik-portfolio.b-cdn.net/Lab/textScrolly.webm",
    "threedwave": "https://malik-portfolio.b-cdn.net/Lab/threedwave.webm",
    "tile-hover-distortion": "https://malik-portfolio.b-cdn.net/Lab/tile-hover-distortion.webm",
    "zoom-carousel": "https://malik-portfolio.b-cdn.net/Lab/zoom-carousel.webm",
    "infinite-scroll-bulge-vertical": "https://malik-portfolio.b-cdn.net/Lab/infinte-scroll-bulge-vertical.mp4",
    "infinite-scroll-bulge-horizontal": "https://malik-portfolio.b-cdn.net/Lab/infinte-scroll-bulge-horizontal.mp4",
    "circular-infinite-carousel": "https://malik-portfolio.b-cdn.net/Lab/circular-carousel.mp4",
    "infinity-scale-carousel": "https://malik-portfolio.b-cdn.net/Lab/infinity-scale-carousel.mp4",
    "snake-image-trail": "https://malik-portfolio.b-cdn.net/Lab/snake-image-trail.mp4",
    "peeling-image-carousel": "https://malik-portfolio.b-cdn.net/Lab/peeling-image-carousel.mp4",
    "ascii-art": "https://malik-portfolio.b-cdn.net/Lab/ascii-art.mp4",
    "smooth-parallax-scroll": "https://malik-portfolio.b-cdn.net/Lab/parallax.mp4",
    "pretext": "https://malik-portfolio.b-cdn.net/Lab/pretext.mp4",
    "text-distortion-shader": "https://malik-portfolio.b-cdn.net/Lab/text-distortion-shader.mp4",
    "text-hover-distortion": "https://malik-portfolio.b-cdn.net/Lab/text-hover-distortion-rgb.mp4",
  };

  // Transform frameworks into the format expected by InfiniteDraggableGrid
  const demoVideos = frameworks.map((demo) => ({
    src: videoUrls[demo.value],
    alt: demo.label,
    value: demo.value,
    label: demo.label,
    isVideo: !!videoUrls[demo.value],
    isPlaceholder: !videoUrls[demo.value],
  }));

  return (
    <>
      {/* <LoadingScreen /> */}
      {isMobile ? (
        <main className="w-full min-h-screen mt-32 pb-24" data-transition-content>
          <div className="flex flex-col gap-8">
            {demoVideos.filter((demo) => demo.isVideo).map((demo) => (
              <DemoCard key={demo.value} demo={demo} onNavigate={() => router.push(`/lab/${demo.value}`)} />
            ))}
          </div>
        </main>
      ) : (
        <main className="w-full h-full absolute top-0 left-0 bg-white" data-transition-content>
          <InfiniteDraggableGrid
            images={demoVideos}
            detail={true}
            showLabel={false}
          />
        </main>
      )}
    </>
  );
}
