// Configuration for the Rubik's Cube demo

export const defaultConfig = {
  // Cube dimensions
  cubeSize: 1,
  gap: 0.2, // 20% of cube size - medium spacing

  // Camera
  cameraFov: 50,
  cameraPosition: [35, 35, 35], // Start very far away (even further)

  // Background
  backgroundColor: '#000000',

  // Animation
  initialSpinDuration: 2, // seconds

  // OrbitControls
  minDistance: 5,
  maxDistance: 50,
  enableDamping: true,
  dampingFactor: 0.05,

  // Lighting
  ambientIntensity: 0.8,
  directionalIntensity: 0.3,

  // Fixed cube size (never changes)
  fixedCubeSize: 0.4,

  // Gap settings (changes with zoom)
  minGap: 0.02, // Gap when far away (very small)
  maxGap: 1.5, // Gap when zoomed in (smaller max)
  gapExponent: 4.0, // Growth curve factor (much higher = much slower initial growth)
};

export default defaultConfig;
