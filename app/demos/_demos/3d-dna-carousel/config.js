// Default configuration for the 3D DNA Carousel

export const defaultConfig = {
  // Geometry
  cylinderRadius: 3,
  spiralFrequency: 2,
  waveAmplitude: 0.5,
  itemSpacing: 0.8,
  itemsPerRotation: 8,

  // Camera
  cameraDistance: 15,
  cameraAngle: 0.3,
  cameraFov: 50,

  // Interaction
  scrollSensitivity: 0.003,
  dragSensitivity: 2,
  momentumDecay: 0.92,
  smoothing: 0.1,

  // Visual
  itemWidth: 1.2,
  itemHeight: 1.5,
  visibleRange: 12,
};

export default defaultConfig;
