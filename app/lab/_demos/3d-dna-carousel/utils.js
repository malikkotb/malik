/**
 * Wraps a number within a range
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @param {number} value - The value to wrap
 * @returns {number} The wrapped value
 */
export function wrap(min, max, value) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

/**
 * Calculates the helical position for an item
 * @param {number} index - The item index
 * @param {number} scrollProgress - Current scroll progress in radians
 * @param {object} config - Configuration object
 * @returns {object} Position and rotation data
 */
export function calculateHelixPosition(index, scrollProgress, config) {
  const {
    cylinderRadius,
    spiralFrequency,
    waveAmplitude,
    itemSpacing,
    itemsPerRotation,
  } = config;

  // Calculate base angle for this item around the cylinder
  const baseAngle = (index / itemsPerRotation) * Math.PI * 2;
  const angle = baseAngle + scrollProgress;

  // X and Z form a circle around the Y axis
  const x = Math.cos(angle) * cylinderRadius;
  const z = Math.sin(angle) * cylinderRadius;

  // Y is the vertical position - linear progression plus wave
  const y = index * itemSpacing + Math.sin(spiralFrequency * angle) * waveAmplitude;

  // Rotation: face outward from cylinder center
  const rotationY = -angle + Math.PI / 2;

  return {
    x,
    y,
    z,
    rotationY,
  };
}

/**
 * Checks if an item is visible based on Y distance from camera
 * @param {number} itemY - Item's Y position
 * @param {number} cameraY - Camera's Y position
 * @param {number} visibleRange - Maximum visible distance
 * @param {number} itemSpacing - Spacing between items
 * @returns {boolean} Whether the item is visible
 */
export function isVisible(itemY, cameraY, visibleRange, itemSpacing) {
  return Math.abs(itemY - cameraY) < visibleRange * itemSpacing;
}
