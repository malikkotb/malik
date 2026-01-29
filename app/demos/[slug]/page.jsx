import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

// Map of all available demos
const demos = {
  "animated-counter": dynamic(() => import("@/app/demos/_demos/animated-counter")),
  "horizontal-section": dynamic(() => import("@/app/demos/_demos/horizontal-section")),
  "mouse-image-distorter": dynamic(() => import("@/app/demos/_demos/mouse-image-distorter")),
  "cursor-blend": dynamic(() => import("@/app/demos/_demos/cursor-blend")),
  "bulge-distortion-shader": dynamic(() => import("@/app/demos/_demos/bulge-distortion-shader")),
  "flashlight-gradient": dynamic(() => import("@/app/demos/_demos/flashlight-gradient")),
  "particle-distorter": dynamic(() => import("@/app/demos/_demos/particle-distorter")),
  "threedwave": dynamic(() => import("@/app/demos/_demos/threedwave")),
  "3d-image-universe": dynamic(() => import("@/app/demos/_demos/3d-image-universe")),
  "3d-video-throwback": dynamic(() => import("@/app/demos/_demos/3d-video-throwback")),
  "tile-hover-distortion": dynamic(() => import("@/app/demos/_demos/tile-hover-distortion")),
  "gradient-shader": dynamic(() => import("@/app/demos/_demos/gradient-shader")),
  "ripple-shader": dynamic(() => import("@/app/demos/_demos/ripple-shader")),
  "particle-morphing-canvas": dynamic(() => import("@/app/demos/_demos/particle-morphing-canvas")),
  "svgMaskScroll": dynamic(() => import("@/app/demos/_demos/svgMaskScroll")),
  "textScrolly": dynamic(() => import("@/app/demos/_demos/textScrolly")),
  "imageTrailEffect": dynamic(() => import("@/app/demos/_demos/imageTrailEffect/page")),
  "pixelated-infinite-scroll": dynamic(() => import("@/app/demos/_demos/pixelated-infinite-scroll/page")),
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
