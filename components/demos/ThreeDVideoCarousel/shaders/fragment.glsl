varying vec2 vUv;
varying float vDepth;

uniform sampler2D u_texture;
uniform float u_depthMin;
uniform float u_depthMax;
uniform float u_desaturation;
uniform float u_darkening;
uniform float u_opacityReduction;

void main() {
  vec4 texColor = texture2D(u_texture, vUv);

  // Calculate normalized depth factor (0 = near, 1 = far)
  float depthFactor = smoothstep(u_depthMin, u_depthMax, vDepth);

  // Apply desaturation to distant panels
  float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
  vec3 desaturated = mix(texColor.rgb, vec3(gray), depthFactor * u_desaturation);

  // Apply darkening to distant panels
  vec3 darkened = desaturated * (1.0 - depthFactor * u_darkening);

  // Apply opacity reduction to distant panels
  float opacity = texColor.a * (1.0 - depthFactor * u_opacityReduction);

  gl_FragColor = vec4(darkened, opacity);
}
