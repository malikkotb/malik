// Configuration for the Rubik's Cube demo

export const defaultConfig = {
  // Cube dimensions
  cubeSize: 1,
  gap: 0.2, // 20% of cube size - medium spacing

  // Camera
  cameraFov: 50,
  cameraPosition: [6, 6, 6],

  // Background
  backgroundColor: '#000000',

  // Animation
  initialSpinDuration: 2, // seconds

  // OrbitControls
  minDistance: 5,
  maxDistance: 20,
  enableDamping: true,
  dampingFactor: 0.05,

  // Lighting
  ambientIntensity: 0.8,
  directionalIntensity: 0.3,
};

export default defaultConfig;
