import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

// Map of all available Three.js lessons (private - accessible via direct URL only)
const lessons = {
  "04-transform-objects": dynamic(() => import("@/app/demos/three-d/_lessons/04-transform-objects")),
  "05-animations": dynamic(() => import("@/app/demos/three-d/_lessons/05-animations")),
  "06-cameras": dynamic(() => import("@/app/demos/three-d/_lessons/06-cameras")),
  "07-fullscreen-and-resizing": dynamic(() => import("@/app/demos/three-d/_lessons/07-fullscreen-and-resizing")),
  "08-geometries": dynamic(() => import("@/app/demos/three-d/_lessons/08-geometries")),
  "09-debug-ui": dynamic(() => import("@/app/demos/three-d/_lessons/09-debug-ui")),
  "10-textures": dynamic(() => import("@/app/demos/three-d/_lessons/10-textures")),
  "11-materials": dynamic(() => import("@/app/demos/three-d/_lessons/11-materials")),
  "12-3d-text": dynamic(() => import("@/app/demos/three-d/_lessons/12-3d-text")),
  "13-lights": dynamic(() => import("@/app/demos/three-d/_lessons/13-lights")),
  "14-shadows": dynamic(() => import("@/app/demos/three-d/_lessons/14-shadows")),
  "15-haunted-house": dynamic(() => import("@/app/demos/three-d/_lessons/15-haunted-house")),
  "16-particles": dynamic(() => import("@/app/demos/three-d/_lessons/16-particles")),
  "17-galaxy-generator": dynamic(() => import("@/app/demos/three-d/_lessons/17-galaxy-generator")),
  "18-scroll-animations": dynamic(() => import("@/app/demos/three-d/_lessons/18-scroll-animations")),
  "19-physics": dynamic(() => import("@/app/demos/three-d/_lessons/19-physics")),
  "24-shaders-raw": dynamic(() => import("@/app/demos/three-d/_lessons/24-shaders-raw")),
  "24-shaderss": dynamic(() => import("@/app/demos/three-d/_lessons/24-shaderss")),
  "25-shader-patterns": dynamic(() => import("@/app/demos/three-d/_lessons/25-shader-patterns")),
  "26-raging-sea": dynamic(() => import("@/app/demos/three-d/_lessons/26-raging-sea")),
  "27-animated-galaxy": dynamic(() => import("@/app/demos/three-d/_lessons/27-animated-galaxy")),
};

export function generateStaticParams() {
  return Object.keys(lessons).map((lesson) => ({
    lesson,
  }));
}

export default async function LessonPage({ params }) {
  const { lesson } = await params;

  const LessonComponent = lessons[lesson];

  if (!LessonComponent) {
    notFound();
  }

  return <LessonComponent />;
}
