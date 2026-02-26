import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

// Map of all available demos
const demos = {
  "mouse-image-distorter": dynamic(() => import("@/app/lab/_demos/mouse-image-distorter")),
  "bulge-distortion-shader": dynamic(() => import("@/app/lab/_demos/bulge-distortion-shader")),
  "threedwave": dynamic(() => import("@/app/lab/_demos/threedwave")),
  "3d-image-universe": dynamic(() => import("@/app/lab/_demos/3d-image-universe")),
  "3d-video-throwback": dynamic(() => import("@/app/lab/_demos/3d-video-throwback")),
  "tile-hover-distortion": dynamic(() => import("@/app/lab/_demos/tile-hover-distortion")),
  "ripple-shader": dynamic(() => import("@/app/lab/_demos/ripple-shader")),
  "svgMaskScroll": dynamic(() => import("@/app/lab/_demos/svgMaskScroll")),
  "textScrolly": dynamic(() => import("@/app/lab/_demos/textScrolly")),
  "imageTrailEffect": dynamic(() => import("@/app/lab/_demos/imageTrailEffect/page")),
  "pixelated-infinite-scroll": dynamic(() => import("@/app/lab/_demos/pixelated-infinite-scroll/page")),
  "zoom-carousel": dynamic(() => import("@/app/lab/_demos/zoom-carousel")),
  "3d-dna-carousel": dynamic(() => import("@/app/lab/_demos/3d-dna-carousel")),
  "infinite-scroll-bulge-vertical": dynamic(() => import("@/app/lab/_demos/infinite-scroll-bulge-vertical")),
  "infinite-scroll-bulge-horizontal": dynamic(() => import("@/app/lab/_demos/infinite-scroll-bulge-horizontal")),
  "infinity-scale-carousel": dynamic(() => import("@/app/lab/_demos/infinity-scale-carousel")),
  "circular-infinite-carousel": dynamic(() => import("@/app/lab/_demos/circular-infinite-carousel")),
  "snake-image-trail": dynamic(() => import("@/app/lab/_demos/snake-image-trail")),
  // "rubiks-cube": dynamic(() => import("@/app/lab/_demos/rubiks-cube")),
};

export function generateStaticParams() {
  return Object.keys(demos).map((slug) => ({
    slug,
  }));
}

export default async function DemoPage({ params }) {
  const { slug } = await params;

  const DemoComponent = demos[slug];

  if (!DemoComponent) {
    notFound();
  }

  return <DemoComponent />;
}
