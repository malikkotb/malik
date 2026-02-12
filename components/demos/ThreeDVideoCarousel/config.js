// 3D Video Carousel Configuration

export const config = {
  // Panel count
  panelCount: 8,

  // Cylinder dimensions
  cylinderRadius: 3.5,

  // Panel dimensions (16:9 aspect ratio)
  panelWidth: 1.6,
  panelHeight: 0.9,

  // Random offset ranges for hybrid scattered look
  offsets: {
    radial: 0.15,    // ±0.15 closer/farther from center
    vertical: 0.1,   // ±0.1 up/down
    angular: 0.03,   // ±0.03 rad rotational jitter
  },

  // Panel curvature (how much panels bend around the cylinder)
  panelCurve: 0.15,

  // Animation smoothing
  smoothing: 0.08,

  // Scroll mapping: rotations during full scroll through section
  scrollRotations: 2,

  // Depth effect settings
  depthEffect: {
    desaturation: 0.5,    // 50% desaturation on distant panels
    darkening: 0.3,       // 30% darkening
    opacityReduction: 0.4 // 40% opacity reduction
  }
};

// Responsive breakpoints
export const responsiveConfig = {
  desktop: {
    radius: 3.5,
    panelWidth: 1.6,
    panelHeight: 0.9
  },
  tablet: {
    radius: 3.0,
    panelWidth: 1.4,
    panelHeight: 0.788
  },
  mobile: {
    radius: 2.5,
    panelWidth: 1.2,
    panelHeight: 0.675
  }
};

// Get responsive config based on window width
export function getResponsiveConfig(width) {
  if (width < 640) {
    return responsiveConfig.mobile;
  } else if (width < 1024) {
    return responsiveConfig.tablet;
  }
  return responsiveConfig.desktop;
}
