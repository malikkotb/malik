import * as THREE from 'three';

/**
 * Creates a Three.js texture from text rendered on a canvas
 * @param {string} text - The text to render
 * @param {Object} options - Configuration options
 * @returns {Object} - { texture, width, height }
 */
export function createTextTexture(text, options = {}) {
  const {
    fontSize = 24,
    fontFamily = 'PPNeueMontreal Medium, sans-serif',
    color = '#000000',
    backgroundColor = '#ffffff',
    lineHeight = 1.3,
    maxWidth = 400,
    padding = 20,
    textTransform = 'none',
    letterSpacing = 0,
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Apply text transform
  let displayText = text;
  if (textTransform === 'uppercase') {
    displayText = text.toUpperCase();
  } else if (textTransform === 'lowercase') {
    displayText = text.toLowerCase();
  }

  // Set font for measuring
  ctx.font = `${fontSize}px ${fontFamily}`;

  // Word wrap the text
  const words = displayText.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth - padding * 2) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word);
      }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  // Calculate canvas dimensions
  const lineHeightPx = fontSize * lineHeight;
  const textHeight = lines.length * lineHeightPx;
  const canvasWidth = Math.ceil(maxWidth);
  const canvasHeight = Math.ceil(textHeight + padding * 2);

  // Set canvas size (use power of 2 for better GPU performance)
  canvas.width = Math.pow(2, Math.ceil(Math.log2(canvasWidth)));
  canvas.height = Math.pow(2, Math.ceil(Math.log2(canvasHeight)));

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set text properties
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';

  // Draw text lines
  lines.forEach((line, index) => {
    const y = padding + index * lineHeightPx;

    if (letterSpacing > 0) {
      // Draw with letter spacing
      let x = padding;
      for (const char of line) {
        ctx.fillText(char, x, y);
        x += ctx.measureText(char).width + letterSpacing;
      }
    } else {
      ctx.fillText(line, padding, y);
    }
  });

  // Create Three.js texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return {
    texture,
    width: canvasWidth,
    height: canvasHeight,
    canvas,
  };
}

/**
 * Creates a texture from an array of text lines (for services list, etc.)
 * @param {string[]} lines - Array of text lines
 * @param {Object} options - Configuration options
 * @returns {Object} - { texture, width, height }
 */
export function createMultiLineTexture(lines, options = {}) {
  const {
    fontSize = 12,
    fontFamily = 'PPNeueMontreal Medium, sans-serif',
    color = '#000000',
    backgroundColor = '#ffffff',
    lineHeight = 1.3,
    padding = 20,
    textTransform = 'none',
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Apply text transform
  let displayLines = lines;
  if (textTransform === 'uppercase') {
    displayLines = lines.map(l => l.toUpperCase());
  } else if (textTransform === 'lowercase') {
    displayLines = lines.map(l => l.toLowerCase());
  }

  // Set font for measuring
  ctx.font = `${fontSize}px ${fontFamily}`;

  // Find max width
  let maxWidth = 0;
  displayLines.forEach(line => {
    const metrics = ctx.measureText(line);
    maxWidth = Math.max(maxWidth, metrics.width);
  });

  // Calculate canvas dimensions
  const lineHeightPx = fontSize * lineHeight;
  const textHeight = displayLines.length * lineHeightPx;
  const canvasWidth = Math.ceil(maxWidth + padding * 2);
  const canvasHeight = Math.ceil(textHeight + padding * 2);

  // Set canvas size
  canvas.width = Math.pow(2, Math.ceil(Math.log2(canvasWidth)));
  canvas.height = Math.pow(2, Math.ceil(Math.log2(canvasHeight)));

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set text properties
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';

  // Draw text lines
  displayLines.forEach((line, index) => {
    const y = padding + index * lineHeightPx;
    ctx.fillText(line, padding, y);
  });

  // Create Three.js texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return {
    texture,
    width: canvasWidth,
    height: canvasHeight,
    canvas,
  };
}

/**
 * Renders a DOM element to a canvas texture using html2canvas approach
 * Note: This is a simpler approach - for complex layouts, consider html2canvas library
 */
export function createDOMTexture(element, options = {}) {
  const {
    scale = 2,
    backgroundColor = '#ffffff',
  } = options;

  const rect = element.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, rect.width, rect.height);

  // Note: This won't work for complex DOM - would need html2canvas
  // For now, return a placeholder
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return {
    texture,
    width: rect.width,
    height: rect.height,
  };
}
