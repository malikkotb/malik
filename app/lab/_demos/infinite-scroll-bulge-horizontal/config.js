// Configuration for infinite scroll gallery with curved surface

export const config = {
  // Grid layout
  columns: 4,
  rows: 2,  // Visible columns (we'll tile for infinite)

  // Scroll behavior
  scrollSensitivity: 0.0015,
  smoothing: 0.08,

  // Curved surface (velocity-activated cosine dome)
  curveDepth: 1.2,        // Max curve depth when scrolling at full speed

  // Image spacing
  gap: 0.06,              // Gap between images as fraction of cell size
};

export default config;
