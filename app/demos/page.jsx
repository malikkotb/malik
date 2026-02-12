"use client";
import { useRouter } from "next/navigation";
import InfiniteDraggableGrid from "@/app/demos/_demos/infinite-draggable-grid/page";
import { frameworks } from "@/components/demos/ui/ComboBox";

export default function DemosPage() {
  const router = useRouter();

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
    src: videoUrls[demo.value] || "/image.png", // Fallback to image if no video
    alt: demo.label,
    value: demo.value,
    label: demo.label,
    isVideo: !!videoUrls[demo.value],
  }));

  return (
    <main className="w-full h-full absolute top-0 left-0">
      <InfiniteDraggableGrid
        images={demoVideos}
        detail={true}
        showLabel={false}
      />
    </main>
  );
}
