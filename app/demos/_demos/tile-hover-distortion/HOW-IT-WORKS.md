# DataTexture Pixel Distortion - How It Works

A step-by-step breakdown of the liquid-drag distortion effect using Three.js DataTextures.

---

## Overview

This effect creates a smooth, brush-stroke-like distortion by storing displacement vectors in a texture that updates each frame based on mouse velocity. When you move the cursor over the image, it "drags" pixels in the direction of movement, with the distortion gradually settling back to normal.

**Key Concept:** Instead of calculating distortion in real-time in the shader, we pre-compute displacement values on the CPU and store them in a DataTexture that the shader reads from.

---

## Step 1: DataTexture Setup

### What It Does
Creates a Float32Array that stores X/Y displacement values for each cell in a grid.

### Why
DataTextures let us update displacement values every frame on the CPU (JavaScript), which is easier than managing complex state in shaders. The GPU reads these values super fast during rendering.

### The Code

```javascript
const createDataTexture = (size) => {
  const data = new Float32Array(4 * size * size);
  for (let i = 0; i < size * size; i++) {
    data[i * 4] = 0;      // R - X displacement
    data[i * 4 + 1] = 0;  // G - Y displacement
    data[i * 4 + 2] = 0;  // B - unused
    data[i * 4 + 3] = 1;  // A - alpha
  }

  const texture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
};
```

### Visualization

```
DataTexture Grid (34x34 example):
Each cell stores [X_displacement, Y_displacement, 0, 1]

┌────┬────┬────┬────┐
│[0,0││0,0││0,0││0,0│
│ 0,1│ 0,1│ 0,1│ 0,1│
├────┼────┼────┼────┤
│[0,0││[0,0││[0,0││[0,0│
│ 0,1│ 0,1│ 0,1│ 0,1│
├────┼────┼────┼────┤
│[0,0││[0,0││[0,0││[0,0│
│ 0,1│ 0,1│ 0,1│ 0,1│
└────┴────┴────┴────┘

Initially all displacement values = 0
```

---

## Step 2: Mouse Velocity Tracking

### What It Does
Calculates how fast and in what direction the mouse is moving by comparing current position to previous position.

### Why
**Velocity (not just position) creates the brush effect.** Fast movements = strong distortion. Slow/stopped = weak/no distortion. This makes it feel like you're "dragging through liquid."

### The Code

```javascript
const mouseState = {
  x: 0.5,
  y: 0.5,
  prevX: 0.5,
  prevY: 0.5,
  vX: 0,      // X velocity
  vY: 0,      // Y velocity
};

// In mousemove handler:
const uv = intersects[0].uv;

mouseState.vX = uv.x - mouseState.prevX;  // Change in X
mouseState.vY = uv.y - mouseState.prevY;  // Change in Y

mouseState.prevX = mouseState.x;
mouseState.prevY = mouseState.y;
mouseState.x = uv.x;
mouseState.y = uv.y;
```

### Visualization

```
Frame 1:      Frame 2:      Frame 3:
Mouse at      Mouse at      Mouse at
(0.3, 0.5)    (0.4, 0.5)    (0.6, 0.5)

   ●            ○ ●           ○   ○ ●

vX = 0        vX = 0.1      vX = 0.2
(stationary)  (slow)        (fast!)

Faster movement → Higher vX/vY → Stronger distortion
```

---

## Step 3: Raycaster & Hover Detection

### What It Does
Detects when the cursor is over the plane and converts screen coordinates to UV coordinates (0-1 range on the texture).

### Why
We need UV coordinates (not screen pixels) because:
1. UV space matches the DataTexture grid (0 to 1)
2. UV coordinates are resolution-independent
3. We can directly map UV to grid cells

### The Code

```javascript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const handleMouseMove = (e) => {
  // Convert to normalized device coordinates (-1 to 1)
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(plane);

  if (intersects.length > 0) {
    isHovering = true;
    const uv = intersects[0].uv;  // This is the magic!
    // uv.x and uv.y are in 0-1 range
  }
};
```

### Visualization

```
Screen Space:              UV Space (on plane):
┌─────────────┐           ┌─────────────┐
│(0,0)        │           │(0,1)   (1,1)│
│             │           │             │
│             │   →→→     │             │
│      Mouse  │   →→→     │    UV(0.6,  │
│        ●    │           │        0.4) │
│             │           │      ●      │
│             │           │             │
│      (W,H)  │           │(0,0)   (1,0)│
└─────────────┘           └─────────────┘
```

---

## Step 4: Distance-Based Power Calculation

### What It Does
For each grid cell, calculates distance to cursor. Closer cells get stronger displacement (inverse relationship).

### Why
Creates a circular "brush" effect where the center has maximum influence and it falls off toward the edges. This prevents harsh boundaries and makes the distortion feel organic.

### The Code

```javascript
const updateDataTexture = () => {
  const data = dataTexture.image.data;
  const size = settings.grid;  // e.g., 34

  // Convert mouse UV (0-1) to grid coordinates (0-34)
  const gridMouseX = size * mouseState.x;
  const gridMouseY = size * mouseState.y;
  const maxDist = size * settings.mouse;  // Radius of influence
  const maxDistSq = maxDist ** 2;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // Calculate distance from this cell to cursor
      const distance = ((gridMouseX - i) ** 2) / aspect + (gridMouseY - j) ** 2;

      if (distance < maxDistSq) {
        const index = 4 * (i + size * j);

        // Inverse relationship: closer = higher power
        let power = maxDist / Math.sqrt(distance);
        power = clamp(power, 0, 10);

        // Apply velocity-scaled displacement
        data[index] += settings.strength * 100 * mouseState.vX * power;
        data[index + 1] -= settings.strength * 100 * mouseState.vY * power;
      }
    }
  }
};
```

### Visualization

```
Grid with cursor at center:

Power falloff (side view):
     10│    ╱‾‾‾╲
       │   ╱     ╲
Power  │  ╱       ╲
     5 │ ╱         ╲
       │╱           ╲___
     0 └─────●─────────────→ Distance
          Cursor

Top-down view of influence area:

┌────────────────┐
│                │  Outside maxDist
│     ▒▒▒▒▒      │  = No effect
│   ▒▓▓▓▓▓▓▒     │
│  ▒▓▓███▓▓▓▒    │  ███ = Maximum power (close to cursor)
│  ▒▓▓█●█▓▓▓▒    │  ▓▓▓ = Medium power
│  ▒▓▓███▓▓▓▒    │  ▒▒▒ = Low power
│   ▒▓▓▓▓▓▓▒     │
│     ▒▒▒▒▒      │
└────────────────┘
```

---

## Step 5: Relaxation/Decay System

### What It Does
Every frame, multiplies all displacement values by 0.9 (or another relaxation factor). This causes distortion to gradually fade back to zero.

### Why
Without decay, displacements would accumulate infinitely. Relaxation creates the "liquid settling" effect - fast decay (0.85) = quick settle, slow decay (0.95) = long trails.

### The Code

```javascript
const updateDataTexture = () => {
  const data = dataTexture.image.data;

  // Apply relaxation FIRST (every frame, regardless of hover)
  for (let i = 0; i < data.length; i += 4) {
    data[i] *= settings.relaxation;      // X displacement
    data[i + 1] *= settings.relaxation;  // Y displacement
  }

  // Then add new displacement based on mouse
  // (only if hovering)

  // Also decay velocity
  mouseState.vX *= 0.9;
  mouseState.vY *= 0.9;
};
```

### Visualization

```
Displacement over time (no new input):

Frame 1:  displacement = 100
Frame 2:  displacement = 100 × 0.9 = 90
Frame 3:  displacement = 90 × 0.9 = 81
Frame 4:  displacement = 81 × 0.9 = 72.9
Frame 5:  displacement = 72.9 × 0.9 = 65.6
...
Frame 20: displacement ≈ 12.2
Frame 50: displacement ≈ 0.5  (basically settled)

Exponential decay curve:
100│●
   │ ●
   │  ●●
 50│    ●●●
   │       ●●●●
   │           ●●●●●●●●●──────
  0└──────────────────────────→ Time
```

---

## Step 6: Fragment Shader UV Offsetting

### What It Does
Reads displacement from DataTexture and offsets the UV coordinates before sampling the actual image texture.

### Why
**Offsetting UVs = distorting the image.** If we sample the image at UV + offset instead of UV, we're reading from a different location, creating the visual distortion. The DataTexture stores these offsets.

### The Code

```glsl
// fragment.glsl
uniform sampler2D uDataTexture;  // Displacement values
uniform sampler2D uTexture;      // The actual image
uniform vec4 uResolution;

varying vec2 vUv;

void main() {
    // Apply aspect ratio correction for object-fit:cover
    vec2 newUV = (vUv - vec2(0.5)) * uResolution.zw + vec2(0.5);

    // Sample displacement from DataTexture
    vec4 offset = texture2D(uDataTexture, vUv);

    // Offset UV by displacement (0.02 controls intensity)
    // offset.r = X displacement, offset.g = Y displacement
    vec4 color = texture2D(uTexture, newUV - 0.02 * offset.rg);

    gl_FragColor = color;
    #include <colorspace_fragment>
}
```

### Visualization

```
Normal sampling:          With displacement:
┌────────────┐           ┌────────────┐
│ ▓▓▓▓▓▓▓▓▓▓ │           │ ▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓ │           │ ▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓ │           │ ▓▓╱──╲▓▓▓▓ │  ← Pixels sampled
│ ▓▓▓▓●▓▓▓▓▓ │           │ ▓▓│●←│▓▓▓▓ │    from offset
│ ▓▓▓▓▓▓▓▓▓▓ │           │ ▓▓╲__╱▓▓▓▓ │    location
│ ▓▓▓▓▓▓▓▓▓▓ │           │ ▓▓▓▓▓▓▓▓▓▓ │
└────────────┘           └────────────┘
Sample at UV (0.5,0.5)   Sample at UV (0.5,0.5) - offset.rg
→ Center pixel           → Slightly left pixel → Visual distortion!

The 0.02 multiplier:
- Small value (0.01) = subtle distortion
- Medium value (0.02) = noticeable distortion  ← We use this
- Large value (0.1) = extreme distortion
```

---

## Step 7: The Animation Loop

### What It Does
Every frame: update DataTexture data, mark as needsUpdate, render the scene.

### Why
The GPU doesn't automatically know when Float32Array changes. We must tell it "hey, re-upload this texture to VRAM" via `needsUpdate = true`.

### The Code

```javascript
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // 1. Update shader uniform
  material.uniforms.time.value = elapsedTime;

  // 2. Update displacement data
  updateDataTexture();
  // Inside updateDataTexture, we set:
  // dataTexture.needsUpdate = true;  ← CRITICAL!

  // 3. Render
  renderer.render(scene, camera);

  // 4. Loop
  requestAnimationFrame(tick);
};
```

### Visualization

```
Animation Loop Flow:

┌──────────────────────────────────────┐
│  requestAnimationFrame calls tick()  │
└───────────────┬──────────────────────┘
                ↓
    ┌───────────────────────┐
    │ 1. Update time uniform│
    └───────────┬───────────┘
                ↓
    ┌───────────────────────┐
    │ 2. updateDataTexture()│───→ Apply relaxation to all cells
    │                       │───→ Add velocity-based displacement
    │                       │───→ Decay velocity
    │                       │───→ texture.needsUpdate = true ★
    └───────────┬───────────┘
                ↓
    ┌───────────────────────┐
    │ 3. Render scene       │───→ GPU reads DataTexture
    └───────────┬───────────┘     Fragment shader offsets UVs
                ↓                  Image appears distorted
    ┌───────────────────────┐
    │ 4. Loop back          │
    └───────────┬───────────┘
                ↓
    ┌──────────────────────────────────────┐
    │  requestAnimationFrame calls tick()  │
    └──────────────────────────────────────┘

Runs at ~60 FPS
```

---

## The Full Picture: How Everything Works Together

```
USER MOVES MOUSE
      ↓
Raycaster detects intersection → Get UV coordinates
      ↓
Calculate velocity (current - previous position)
      ↓
Convert UV to grid coordinates
      ↓
For each grid cell:
  - Calculate distance to cursor
  - If within radius:
    - Calculate power (inverse of distance)
    - Add displacement = velocity × power × strength
      ↓
Apply relaxation to ALL cells (multiply by 0.9)
      ↓
Mark DataTexture as needsUpdate
      ↓
GPU renders frame:
  - Fragment shader reads displacement from DataTexture
  - Offsets UV coordinates by displacement
  - Samples image at offset UV
  - Distorted image appears on screen!
      ↓
Repeat 60 times per second
```

---

## Key Settings Explained

### Grid Resolution (settings.grid)
- **Lower (10-20):** Chunky, blocky distortion (fewer cells)
- **Higher (50-100):** Smooth, detailed distortion (more cells)
- **Trade-off:** Higher = more CPU work per frame

### Mouse Radius (settings.mouse)
- **Lower (0.1):** Small, focused brush
- **Higher (0.5):** Large, sweeping brush
- **Formula:** `maxDist = gridSize × mouse` (e.g., 34 × 0.25 = 8.5 cells)

### Strength (settings.strength)
- **Lower (0.5):** Subtle distortion
- **Higher (2.0):** Extreme distortion
- **Multiplier:** Applied to velocity when adding displacement

### Relaxation (settings.relaxation)
- **Lower (0.85):** Fast settle (snappy)
- **Higher (0.95):** Slow settle (lingering trails)
- **Sweet spot:** 0.9 for natural liquid feel

---

## Why This Approach?

### CPU-Side Updates (JavaScript)
✅ Easy to debug and modify logic
✅ Can use familiar JS math and loops
✅ Complex state management is simpler

### GPU-Side Rendering (Shaders)
✅ DataTexture is small (34×34 = 1,156 values)
✅ Shader just reads and offsets (super fast)
✅ Separates "simulation" from "rendering"

### The Hybrid Approach
The best of both worlds! JavaScript handles the physics/simulation, GPU handles the visual output.

---

## Common Gotchas

### 1. Y-Axis Flip
Raycaster UVs have y=0 at bottom, but screen coords have y=0 at top. We **don't** flip in `gridMouseY = size * mouseState.y` because raycaster already gives us the correct orientation.

### 2. The Minus Sign
```javascript
data[index + 1] -= settings.strength * 100 * mouseState.vY * power;
```
The subtraction matches the demo and creates correct directional distortion. This is related to how UV offsets are applied in the shader.

### 3. Aspect Ratio Correction
```javascript
const distance = ((gridMouseX - i) ** 2) / aspect + (gridMouseY - j) ** 2;
```
Without `/aspect`, the brush would be elliptical on non-square planes. This keeps it circular.

### 4. DataTexture Format
Modern Three.js uses `THREE.RGBAFormat` (4 channels) instead of deprecated `THREE.RGBFormat` (3 channels). We use stride of 4, not 3.

---

## Summary

This effect is essentially a **real-time displacement map** where:
1. You paint displacement values based on mouse movement
2. Those values gradually fade out (relaxation)
3. The shader reads the displacement map and distorts the image accordingly

It feels "liquid" because:
- Velocity-based (fast movement = strong effect)
- Distance-based falloff (circular brush)
- Exponential decay (natural settling)
- Frame-by-frame updates (smooth animation)

The magic is in the combination of all these elements working together! 🎨✨
