// Configuration for infinite scroll gallery with curved surface

export const config = {
  // Grid layout
  columns: 4,
  rows: 3,  // Visible rows (we'll tile for infinite)

  // Scroll behavior
  scrollSensitivity: 0.0015,
  smoothing: 0.08,

  // Curved surface (vertical sin wave bulge)
  curveDepth: 1.2,        // How deep the curve dips inward
  curveWidth: 2.0,        // Height of the curved region (in world units)

  // Image spacing
  gap: 0.06,              // Gap between images as fraction of cell size
};

export default config;
