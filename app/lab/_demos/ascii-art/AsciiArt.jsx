"use client";

import { useEffect, useRef } from "react";
import { ASCII_FULL } from "./constants";

class Particle {
  constructor(x, y, char, alpha) {
    this.homeX = x;
    this.homeY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.char = char;
    this.alpha = alpha;
  }
}

function getAsciiChar(brightness, density) {
  const chars = ASCII_FULL.slice(0, density);
  const idx = Math.floor((brightness / 255) * (chars.length - 1));
  return chars[Math.min(idx, chars.length - 1)];
}

function applyImageAdjust(pixel, brightness, contrast) {
  let val = pixel + brightness;
  const f = (259 * (contrast + 255)) / (255 * (259 - contrast));
  val = f * (val - 128) + 128;
  return Math.max(0, Math.min(255, val));
}

export default function AsciiArt({
  imageSrc = "/demos/husky-silhouette.svg",
  color = "#000",
  config,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const configRef = useRef(config);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const scrollVelRef = useRef({ vx: 0, vy: 0 });
  const rafRef = useRef(null);
  const idleTimerRef = useRef(null);
  const imgRef = useRef(null);
  const scaleRef = useRef({ x: 1, y: 1 });
  const fontColorRef = useRef({ r: 0, g: 0, b: 0 });
  const lastScrollY = useRef(0);
  const cursorInfluenceRef = useRef(0);

  // Keep config ref in sync
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Parse font color from canvas computed style
  function parseFontColor(canvas) {
    const style = getComputedStyle(canvas);
    const c = style.color;
    const m = c.match(/\d+/g);
    if (m && m.length >= 3) {
      fontColorRef.current = {
        r: parseInt(m[0]),
        g: parseInt(m[1]),
        b: parseInt(m[2]),
      };
    }
  }

  function processImage() {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imgRef.current;
    if (!canvas || !container || !img) return;

    const cfg = configRef.current;
    const rect = container.getBoundingClientRect();

    const charW = cfg.fontSize * 0.62;
    const lineH = cfg.fontSize * 1.3;
    const cols = Math.floor(rect.width / charW);
    const rows = Math.floor(rect.height / lineH);

    // Object-contain: fit inside container, preserve aspect ratio
    // Account for non-square character cells (charW ≠ lineH)
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const charAspect = charW / lineH;
    const gridPixelAspect = (cols * charW) / (rows * lineH);
    let fitCols, fitRows;
    if (imgAspect > gridPixelAspect) {
      // Image wider — match width, letterbox height
      fitCols = cols;
      fitRows = Math.floor((cols * charW) / (imgAspect * lineH));
    } else {
      // Image taller — match height, letterbox width
      fitRows = rows;
      fitCols = Math.floor((rows * lineH * imgAspect) / charW);
    }

    // Canvas matches container size (1:1 pixels to CSS)
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    scaleRef.current.x = 1;
    scaleRef.current.y = 1;

    // Center the art grid within the canvas
    const artW = fitCols * charW;
    const artH = fitRows * lineH;
    const offsetX = (rect.width - artW) / 2;
    const offsetY = (rect.height - artH) / 2;

    // Sample the image
    const offscreen = document.createElement("canvas");
    offscreen.width = fitCols;
    offscreen.height = fitRows;
    const octx = offscreen.getContext("2d");
    octx.drawImage(img, 0, 0, fitCols, fitRows);
    const imageData = octx.getImageData(0, 0, fitCols, fitRows);
    const pixels = imageData.data;

    const particles = [];
    for (let row = 0; row < fitRows; row++) {
      for (let col = 0; col < fitCols; col++) {
        const i = (row * fitCols + col) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a < cfg.alphaThresh) continue;

        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
        gray = applyImageAdjust(gray, cfg.brightness, cfg.contrast);

        const brightness = cfg.invert ? 255 - gray : gray;
        const char = getAsciiChar(brightness, cfg.density);
        const alpha = a / 255;

        const px = offsetX + col * charW;
        const py = offsetY + row * lineH;
        particles.push(new Particle(px, py, char, alpha));
      }
    }

    particlesRef.current = particles;
    parseFontColor(canvas);
  }

  // Rebuild particles when sampling config changes
  useEffect(() => {
    if (imgRef.current) processImage();
  }, [
    config.fontSize,
    config.density,
    config.brightness,
    config.contrast,
    config.alphaThresh,
    config.invert,
  ]);

  // Main setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Load image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      processImage();
      lastScrollY.current = window.scrollY;
      rafRef.current = requestAnimationFrame(animate);
    };
    img.src = imageSrc;

    // Mouse tracking on window — check if within canvas bounds
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (mx >= 0 && mx <= rect.width && my >= 0 && my <= rect.height) {
        mouseRef.current.x = mx * scaleRef.current.x;
        mouseRef.current.y = my * scaleRef.current.y;
        mouseRef.current.active = true;
      } else {
        mouseRef.current.active = false;
      }

      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        mouseRef.current.active = false;
      }, 80);
    };

    // Scroll listener — window scroll, not wheel
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      lastScrollY.current = currentY;

      const cfg = configRef.current;
      const scroll = scrollVelRef.current;
      scroll.vy += delta * cfg.scrollMult * 0.1;
    };

    // ResizeObserver
    const ro = new ResizeObserver(() => {
      if (imgRef.current) processImage();
    });
    ro.observe(container);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(idleTimerRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      ro.disconnect();
    };
  }, [imageSrc]);

  function animate() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const cfg = configRef.current;
    const particles = particlesRef.current;
    const mouse = mouseRef.current;
    const scroll = scrollVelRef.current;
    const fc = fontColorRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${cfg.fontSize}px 'JetBrains Mono', monospace`;
    ctx.textBaseline = "top";

    // Decay scroll velocity
    const scrollDecayFactor = cfg.scrollDecay / 100;
    scroll.vx *= scrollDecayFactor;
    scroll.vy *= scrollDecayFactor;
    if (Math.abs(scroll.vx) < 0.01) scroll.vx = 0;
    if (Math.abs(scroll.vy) < 0.01) scroll.vy = 0;

    const frictionFactor = cfg.friction / 100;
    const returnFactor = cfg.returnSpeed / 100;

    // Smoothly lerp cursor influence in/out instead of binary on/off
    const targetInfluence = mouse.active ? 1 : 0;
    const lerpSpeed = 0.08;
    cursorInfluenceRef.current += (targetInfluence - cursorInfluenceRef.current) * lerpSpeed;
    const cursorInfluence = cursorInfluenceRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Cursor repulsion — atan2 angle, f² quadratic falloff, scaled by smooth influence
      if (cursorInfluence > 0.001) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cfg.cursorRadius && dist > 0) {
          const f = (cfg.cursorRadius - dist) / cfg.cursorRadius;
          const force = f * f * cfg.cursorForce * cursorInfluence;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
        }
      }

      // Scroll scatter — random-ish angles with directional bias
      if (scroll.vx !== 0 || scroll.vy !== 0) {
        const scrollMag = Math.sqrt(
          scroll.vx * scroll.vx + scroll.vy * scroll.vy
        );
        const baseAngle = Math.atan2(scroll.vy, scroll.vx);
        const scatter = (Math.random() - 0.5) * Math.PI;
        const angle = baseAngle + scatter;
        const sf = cfg.scrollForce / 100;
        p.vx += Math.cos(angle) * scrollMag * sf;
        p.vy += Math.sin(angle) * scrollMag * sf;
      }

      // Spring return
      p.vx += (p.homeX - p.x) * returnFactor;
      p.vy += (p.homeY - p.y) * returnFactor;

      // Friction
      p.vx *= frictionFactor;
      p.vy *= frictionFactor;

      // Integrate
      p.x += p.vx;
      p.y += p.vy;

      // Render with per-particle alpha
      ctx.fillStyle = `rgba(${fc.r},${fc.g},${fc.b},${p.alpha})`;
      ctx.fillText(p.char, p.x, p.y);
    }

    rafRef.current = requestAnimationFrame(animate);
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className="block"
        style={{
          color: color,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      />
    </div>
  );
}
