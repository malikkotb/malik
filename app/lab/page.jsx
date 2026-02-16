"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import InfiniteDraggableGrid from "@/app/lab/_demos/infinite-draggable-grid/page";
// import LoadingScreen from "@/components/LoadingScreen";

const frameworks = [
  { value: "mouse-image-distorter", label: "Mouse Image Distorter" },
  { value: "bulge-distortion-shader", label: "Bulge Distortion Shader" },
  // { value: "particle-distorter", label: "Particle Distorter" },
  { value: "threedwave", label: "3D Wave on Scroll" },
  { value: "3d-image-universe", label: "3D Image Universe" },
  { value: "tile-hover-distortion", label: "Tile Hover Distortion" },
  { value: "ripple-shader", label: "Ripple Shader" },
  // { value: "infinite-draggable-grid", label: "Infinite Draggable Grid" },
  // { value: "particle-morphing-canvas", label: "Particle Morphing Canvas" },
  { value: "svgMaskScroll", label: "SVG Mask Scroll" },
  { value: "textScrolly", label: "Text Scrolly" },
  { value: "imageTrailEffect", label: "Image Trail Effect" },
  { value: "pixelated-infinite-scroll", label: "Pixelated Infinite Scroll" },
  { value: "zoom-carousel", label: "Zoom Carousel" },
  { value: "3d-dna-carousel", label: "3D DNA Carousel" },
  { value: "infinite-scroll-bulge-vertical", label: "Infinite Scroll Bulge Vertical" },
  { value: "infinite-scroll-bulge-horizontal", label: "Infinite Scroll Bulge Horizontal" },
  // { value: "rubiks-cube", label: "Rubik's Cube" },
];

export default function DemosPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Lab";
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
      <main className="w-full h-full absolute top-0 left-0 bg-white" data-transition-content>
        <InfiniteDraggableGrid
          images={demoVideos}
          detail={true}
          showLabel={false}
        />
      </main>
    </>
  );
}
