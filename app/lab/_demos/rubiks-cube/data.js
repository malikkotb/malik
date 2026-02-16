// Data for Rubik's Cube demo - cube positions and texture assignments

// Available textures
export const textures = [
  '/demos/img1.png',
  '/demos/img2.png',
  '/demos/img3.png',
  '/demos/img4.png',
  '/demos/img5.jpg',
  '/demos/img6.jpg',
  '/demos/img7.png',
  '/demos/img8.png',
];

// Seeded random number generator for consistent shuffling
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Fisher-Yates shuffle with seed
function shuffleArray(array, seed) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate all cubes for maximum grid (5x5x5) - they get shown/hidden based on level
// Stores grid coordinates, actual positions calculated on render
export function generateCubes(seed = 42) {
  const cubes = [];
  const maxGridSize = 5;
  const totalCubes = maxGridSize * maxGridSize * maxGridSize;

  // Create extended texture array (cycle through available textures)
  const extendedTextures = [];
  for (let i = 0; i < totalCubes; i++) {
    extendedTextures.push(textures[i % textures.length]);
  }

  // Shuffle for random distribution
  const shuffledTextures = shuffleArray(extendedTextures, seed);

  let index = 0;
  const halfGrid = Math.floor(maxGridSize / 2); // -2 to 2

  // Generate 5x5x5 grid centered at origin
  for (let x = -halfGrid; x <= halfGrid; x++) {
    for (let y = -halfGrid; y <= halfGrid; y++) {
      for (let z = -halfGrid; z <= halfGrid; z++) {
        // Calculate distance from center (for gradual appearance)
        const absX = Math.abs(x);
        const absY = Math.abs(y);
        const absZ = Math.abs(z);
        const gridDistance = Math.max(absX, absY, absZ); // 0=center, 1=inner ring, 2=outer ring

        cubes.push({
          id: `cube-${x}-${y}-${z}`, // Unique ID based on position
          gridCoord: [x, y, z], // Store grid coordinates
          texture: shuffledTextures[index],
          entryDelay: seededRandom(seed + index + 1000), // Random delay 0-1
          gridDistance: gridDistance, // Distance from center for gradual visibility
        });
        index++;
      }
    }
  }

  return cubes;
}

export default { textures, generateCubes };
