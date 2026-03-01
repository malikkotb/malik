export const config = {
  // Page dimensions (3:4 aspect ratio)
  pageWidth: 1.5,
  pageHeight: 2.0,

  // Curl parameters
  curlRadius: 0.3, // Loose/gentle curl
  curlMaxAngle: Math.PI, // Maximum curl angle

  // Geometry segments for smooth curl
  segmentsX: 64,
  segmentsY: 32,

  // Interaction
  dragThreshold: 0.5, // 50% threshold for completing flip
  dragSensitivity: 2.0, // How much drag maps to flip progress

  // Timing - slow & elegant
  flipDuration: 0.9,

  // Peek (hover) - lifts corner ~10%
  peekAmount: 0.10,
  peekZoneThreshold: 0.7, // Bottom-right 30% of page triggers peek

  // Spring physics for animation
  springStiffness: 8.0,
  springDamping: 0.8,

  // Bounce landing
  bounceStrength: 0.08, // Overshoot amount
  bounceDamping: 0.85, // Decay rate

  // Diagonal fold physics
  cornerLagFactor: 0.3, // How much top corner lags behind bottom
  sCurveIntensity: 0.4, // S-curve bend amount at mid-flip

  // Shadow
  shadowIntensity: 0.4,
  shadowSpread: 0.15,
  shadowSoftness: 0.3, // Blur amount that increases with lift

  // Total spreads (each spread shows 2 pages)
  totalSpreads: 4,
};
