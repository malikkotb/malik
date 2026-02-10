"use client";

import { useEffect, useRef, useState } from "react";

const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_uv;
  varying vec2 v_uv;

  void main() {
    v_uv = a_uv;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  varying vec2 v_uv;
  uniform sampler2D u_texture;
  uniform vec2 u_mouse;
  uniform float u_radius;
  uniform float u_redOffset;
  uniform float u_greenOffset;
  uniform float u_blueOffset;

  void main() {
    vec2 mousePos = u_mouse;
    
    // Skip distortion if mouse is off canvas
    if (mousePos.x < 0.0 || mousePos.y < 0.0) {
      gl_FragColor = texture2D(u_texture, v_uv);
      return;
    }
    
    float dist = distance(v_uv, mousePos);
    
    // Calculate distortion strength based on distance from mouse
    float strength = 0.0;
    if (dist < u_radius) {
      // Smooth falloff using smoothstep
      float normalizedDist = dist / u_radius;
      strength = 1.0 - smoothstep(0.0, 1.0, normalizedDist);
    }
    
    // Direction from mouse to current pixel
    vec2 diff = v_uv - mousePos;
    float diffLen = length(diff);
    vec2 dir = diffLen > 0.001 ? diff / diffLen : vec2(0.0);
    
    // Distort each RGB channel with different offsets (using uniforms)
    vec2 redUV = v_uv + strength * u_redOffset * dir;
    vec2 greenUV = v_uv + strength * u_greenOffset * vec2(dir.y, -dir.x);
    vec2 blueUV = v_uv - strength * u_blueOffset * dir;

    float r = texture2D(u_texture, redUV).r;
    float g = texture2D(u_texture, greenUV).g;
    float b = texture2D(u_texture, blueUV).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Unable to create shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Could not compile shader:\n${info}`);
  }

  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  if (!program) {
    throw new Error("Unable to create program");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Could not link program:\n${info}`);
  }

  return program;
}

export default function AboutImage({ src, alt }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mousePosRef = useRef({ x: -1, y: -1 });
  const [fallback, setFallback] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Debug values (using refs so they can be updated without recreating WebGL context)
  const [radius, setRadius] = useState(0.25);
  const [redOffset, setRedOffset] = useState(0.02);
  const [greenOffset, setGreenOffset] = useState(0.015);
  const [blueOffset, setBlueOffset] = useState(0.02);

  const radiusRef = useRef(0.25);
  const redOffsetRef = useRef(0.02);
  const greenOffsetRef = useRef(0.015);
  const blueOffsetRef = useRef(0.02);

  // Sync state to refs
  useEffect(() => {
    radiusRef.current = radius;
    redOffsetRef.current = redOffset;
    greenOffsetRef.current = greenOffset;
    blueOffsetRef.current = blueOffset;
  }, [radius, redOffset, greenOffset, blueOffset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const gl =
      canvas.getContext("webgl", { premultipliedAlpha: false }) ||
      canvas.getContext("experimental-webgl");

    if (!gl) {
      setFallback(true);
      return;
    }

    let program;
    let positionBuffer;
    let uvBuffer;
    let texture;
    let uMouseLocation;
    let uRadiusLocation;
    let uRedOffsetLocation;
    let uGreenOffsetLocation;
    let uBlueOffsetLocation;

    const setup = () => {
      try {
        const vertexShader = createShader(
          gl,
          gl.VERTEX_SHADER,
          vertexShaderSource
        );
        const fragmentShader = createShader(
          gl,
          gl.FRAGMENT_SHADER,
          fragmentShaderSource
        );
        program = createProgram(gl, vertexShader, fragmentShader);
      } catch (error) {
        console.error(error);
        setFallback(true);
        return;
      }

      gl.useProgram(program);

      const positionLocation = gl.getAttribLocation(
        program,
        "a_position"
      );
      const uvLocation = gl.getAttribLocation(program, "a_uv");
      uMouseLocation = gl.getUniformLocation(program, "u_mouse");
      uRadiusLocation = gl.getUniformLocation(program, "u_radius");
      uRedOffsetLocation = gl.getUniformLocation(
        program,
        "u_redOffset"
      );
      uGreenOffsetLocation = gl.getUniformLocation(
        program,
        "u_greenOffset"
      );
      uBlueOffsetLocation = gl.getUniformLocation(
        program,
        "u_blueOffset"
      );

      positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]),
        gl.STATIC_DRAW
      );
      gl.enableVertexAttribArray(uvLocation);
      gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        gl.CLAMP_TO_EDGE
      );
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_T,
        gl.CLAMP_TO_EDGE
      );
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR
      );
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        gl.LINEAR
      );
    };

    const handleResize = (imageWidth, imageHeight) => {
      const width = container.clientWidth;
      if (width === 0) return;
      const ratio = imageHeight / imageWidth;
      const height = width * ratio;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = src;

    const resizeObserver = new ResizeObserver(() => {
      if (image.naturalWidth && image.naturalHeight) {
        handleResize(image.naturalWidth, image.naturalHeight);
      }
    });

    const render = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Pass mouse position (normalized 0-1) and all distortion parameters
      gl.uniform2f(
        uMouseLocation,
        mousePosRef.current.x,
        mousePosRef.current.y
      );
      gl.uniform1f(uRadiusLocation, radiusRef.current);
      gl.uniform1f(uRedOffsetLocation, redOffsetRef.current);
      gl.uniform1f(uGreenOffsetLocation, greenOffsetRef.current);
      gl.uniform1f(uBlueOffsetLocation, blueOffsetRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationRef.current = requestAnimationFrame(render);
    };

    image.onload = () => {
      setup();
      resizeObserver.observe(container);
      handleResize(image.naturalWidth, image.naturalHeight);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );

      render();
    };

    image.onerror = () => {
      setFallback(true);
    };

    return () => {
      resizeObserver.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (program) {
        gl.deleteProgram(program);
      }
      if (positionBuffer) {
        gl.deleteBuffer(positionBuffer);
      }
      if (uvBuffer) {
        gl.deleteBuffer(uvBuffer);
      }
      if (texture) {
        gl.deleteTexture(texture);
      }
    };
  }, [src]);

  const handleMouseMove = (e) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    mousePosRef.current.x = x;
    mousePosRef.current.y = y;
  };

  const handleMouseLeave = () => {
    mousePosRef.current.x = -1;
    mousePosRef.current.y = -1;
  };

  if (fallback) {
    return (
      <div className='w-full'>
        <img
          src={src}
          alt={alt}
          className='w-full h-auto object-cover'
        />
      </div>
    );
  }

  return (
    <div className='relative w-full'>
      <div
        ref={containerRef}
        className='w-full'
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas ref={canvasRef} className='w-full h-auto block' />
      </div>
    </div>
  );
}
