// Configuration for the Circular Infinite Carousel

export const config = {
  // Ellipse geometry
  radiusY: 2.0,           // Vertical ellipse radius (tall)
  radiusZ: 3.5,           // Depth radius (fully rounded, visible circle)
  meshWidth: 0.64,        // Width of the curved mesh (4:5 aspect ratio, portrait)
  bulgeAmount: 0.3,       // How much images scale wider in the middle (0 = no bulge)

  // Images
  totalImages: 8,         // Total images in carousel
  visibleImages: 4.5,     // ~4-5 images visible at once
  gapFraction: 0.02,      // Gap as fraction of image height (~12px equivalent)

  // Interaction
  scrollSensitivity: 0.002,
  dragSensitivity: 0.003,
  smoothing: 0.1,
  momentumDecay: 0.95,

  // Camera
  cameraZ: 6,
  cameraFov: 50,

  // Visual
  backgroundColor: '#ffffff',

  // Mesh resolution
  segmentsX: 32,
  segmentsY: 64,
};

export default config;
