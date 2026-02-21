'use client';

import { forwardRef, useMemo } from 'react';
import { Effect, BlendFunction } from 'postprocessing';
import { Uniform } from 'three';

// Motion Smear Shader - directional streaks along X axis
const motionSmearFragmentShader = `
uniform float intensity;
uniform float samples;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (intensity < 0.001) {
    outputColor = inputColor;
    return;
  }

  vec3 color = vec3(0.0);
  float totalSamples = samples;
  float blurStrength = intensity * 0.05;

  for (float i = 0.0; i < 16.0; i++) {
    if (i >= totalSamples) break;
    float offset = (i / totalSamples - 0.5) * blurStrength;
    color += texture2D(inputBuffer, uv + vec2(offset, 0.0)).rgb;
  }

  outputColor = vec4(color / totalSamples, inputColor.a);
}
`;

// Gaussian Horizontal Shader - soft horizontal blur
const gaussianHorizontalFragmentShader = `
uniform float intensity;
uniform vec2 resolution;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (intensity < 0.001) {
    outputColor = inputColor;
    return;
  }

  // Gaussian weights for 9-tap blur
  float weights[5];
  weights[0] = 0.227027;
  weights[1] = 0.1945946;
  weights[2] = 0.1216216;
  weights[3] = 0.054054;
  weights[4] = 0.016216;

  vec2 texelSize = 1.0 / resolution;
  float blurStrength = intensity * 8.0;

  vec3 color = texture2D(inputBuffer, uv).rgb * weights[0];

  for (int i = 1; i < 5; i++) {
    float offset = float(i) * texelSize.x * blurStrength;
    color += texture2D(inputBuffer, uv + vec2(offset, 0.0)).rgb * weights[i];
    color += texture2D(inputBuffer, uv - vec2(offset, 0.0)).rgb * weights[i];
  }

  outputColor = vec4(color, inputColor.a);
}
`;

// Motion Smear Effect Class
class MotionSmearEffect extends Effect {
  constructor({ intensity = 0, samples = 12 } = {}) {
    super('MotionSmearEffect', motionSmearFragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['intensity', new Uniform(intensity)],
        ['samples', new Uniform(samples)],
      ]),
    });
  }

  set intensity(value) {
    this.uniforms.get('intensity').value = value;
  }

  get intensity() {
    return this.uniforms.get('intensity').value;
  }
}

// Gaussian Horizontal Effect Class
class GaussianHorizontalEffect extends Effect {
  constructor({ intensity = 0, resolution = [1920, 1080] } = {}) {
    super('GaussianHorizontalEffect', gaussianHorizontalFragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['intensity', new Uniform(intensity)],
        ['resolution', new Uniform(resolution)],
      ]),
    });
  }

  set intensity(value) {
    this.uniforms.get('intensity').value = value;
  }

  get intensity() {
    return this.uniforms.get('intensity').value;
  }

  setResolution(width, height) {
    this.uniforms.get('resolution').value = [width, height];
  }
}

// React component for Motion Smear
export const HorizontalMotionBlur = forwardRef(function HorizontalMotionBlur(
  { intensity = 0, samples = 12 },
  ref
) {
  const effect = useMemo(() => new MotionSmearEffect({ intensity, samples }), []);

  return <primitive ref={ref} object={effect} />;
});

// React component for Gaussian Horizontal Blur
export const HorizontalGaussianBlur = forwardRef(function HorizontalGaussianBlur(
  { intensity = 0, resolution = [1920, 1080] },
  ref
) {
  const effect = useMemo(() => new GaussianHorizontalEffect({ intensity, resolution }), []);

  return <primitive ref={ref} object={effect} />;
});
