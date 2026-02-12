import { config } from './config';

// Seeded random number generator for consistent offsets per panel
function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Get a seeded random value in a range
function seededRandomRange(seed, offset, range) {
  const rand = seededRandom(seed + offset);
  return (rand - 0.5) * 2 * range;
}

/**
 * Calculate panel position and rotation in the carousel
 * @param {number} index - Panel index (0 to panelCount-1)
 * @param {object} overrideConfig - Optional config override for responsive values
 * @returns {object} - { x, y, z, rotationY }
 */
export function calculatePanelPosition(index, overrideConfig = {}) {
  const {
    panelCount = config.panelCount,
    cylinderRadius = config.cylinderRadius,
    offsets = config.offsets
  } = { ...config, ...overrideConfig };

  // Base angle for this panel (evenly distributed around circle)
  const baseAngle = (index / panelCount) * Math.PI * 2;

  // Add seeded random angular offset for scattered look
  const angularOffset = seededRandomRange(index, 0, offsets.angular);
  const angle = baseAngle + angularOffset;

  // Add seeded random radial offset
  const radialOffset = seededRandomRange(index, 100, offsets.radial);
  const radius = cylinderRadius + radialOffset;

  // Calculate position on the circle
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  // Add seeded random vertical offset
  const y = seededRandomRange(index, 200, offsets.vertical);

  // Panel should face outward from center (perpendicular to radius)
  // Add PI because panel's default normal faces +Z, we want it facing outward
  const rotationY = angle;

  return { x, y, z, rotationY };
}

/**
 * Calculate depth factor based on panel's Z position relative to camera
 * @param {number} z - Panel's Z position after rotation
 * @param {number} radius - Cylinder radius
 * @returns {number} - Depth factor 0 (far) to 1 (near)
 */
export function calculateDepthFactor(z, radius) {
  // Normalize z from [-radius, radius] to [0, 1]
  // Panels at front (positive Z closer to camera) should have factor closer to 1
  const normalized = (z + radius) / (radius * 2);
  return Math.max(0, Math.min(1, normalized));
}

/**
 * Generate all panel positions for the carousel
 * @param {object} overrideConfig - Optional config override
 * @returns {array} - Array of position/rotation objects
 */
export function generatePanelPositions(overrideConfig = {}) {
  const panelCount = overrideConfig.panelCount || config.panelCount;
  const positions = [];

  for (let i = 0; i < panelCount; i++) {
    positions.push(calculatePanelPosition(i, overrideConfig));
  }

  return positions;
}
