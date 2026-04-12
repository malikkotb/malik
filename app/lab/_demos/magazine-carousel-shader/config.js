export const config = {
  // Page dimensions (3:4 aspect ratio)
  pageWidth: 1.5,
  pageHeight: 2.0,

  // Curl mode: 'tight' | 'loose' | 'dynamic'
  curlMode: 'dynamic',
  curlRadiusTight: 0.12,
  curlRadiusLoose: 0.6,

  // Geometry segments for smooth curl
  segmentsX: 64,
  segmentsY: 32,

  // Interaction
  dragThreshold: 0.5,
  dragSensitivity: 2.0,

  // Peek (hover) - lifts corner ~8%
  peekAmount: 0.08,
  peekZoneThreshold: 0.7,

  // Spring physics
  springStiffness: 8.0,
  springDamping: 0.8,

  // Bounce landing
  bounceStrength: 0.08,
  bounceDamping: 0.85,

  // Shadow
  shadowIntensity: 0.12,
  shadowSpread: 0.18,
  shadowSoftness: 0.3,

  // Spine groove
  spineDepth: 0.04,
  spineWidth: 0.08,

  // Page thickness (stacked paper look)
  pageThickness: 0.004,
  pageStackCount: 3,

  // Swipe gesture
  swipeVelocityThreshold: 0.4,

  // Total spreads
  totalSpreads: 6,
};
