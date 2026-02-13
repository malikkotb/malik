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

// Generate 27 cubes with positions and random textures
export function generateCubes(cubeSize = 1, gap = 0.2, seed = 42) {
  const cubes = [];
  const offset = cubeSize + gap;

  // Create extended texture array (27 cubes need 27 textures, cycling through 8)
  const extendedTextures = [];
  for (let i = 0; i < 27; i++) {
    extendedTextures.push(textures[i % textures.length]);
  }

  // Shuffle for random distribution
  const shuffledTextures = shuffleArray(extendedTextures, seed);

  let index = 0;

  // Generate 3x3x3 grid centered at origin
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubes.push({
          id: index,
          position: [x * offset, y * offset, z * offset],
          texture: shuffledTextures[index],
        });
        index++;
      }
    }
  }

  return cubes;
}

export default { textures, generateCubes };
