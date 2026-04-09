"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  prepareWithSegments,
  layoutNextLine,
  type PreparedTextWithSegments,
  type LayoutCursor,
} from "@chenglou/pretext";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

const FONT_SIZE = 15;
const LINE_HEIGHT = 22;
const FONT = `${FONT_SIZE}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
const PADDING = 40;
const TOP_PADDING = 40;
const COLUMNS = 4;
const COLUMN_GAP = 24;
const WRAP_PADDING_H = 14;
const WRAP_PADDING_V = 2;

const COLORS = [
  "#22c55e",
  "#ef4444",
  "#3b82f6",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#000000",
  "#ffffff",
];

const BRUSH_SIZES = [4, 8, 14, 24, 40];

type StickerShape = "circle" | "square" | "diamond" | "triangle" | "star";

const STICKER_SHAPES: { shape: StickerShape; label: string }[] = [
  { shape: "circle", label: "Circle" },
  { shape: "square", label: "Square" },
  { shape: "diamond", label: "Diamond" },
  { shape: "triangle", label: "Triangle" },
  { shape: "star", label: "Star" },
];

const STICKER_SIZES = [
  { label: "S", size: 80 },
  { label: "M", size: 140 },
  { label: "L", size: 220 },
];

type StickerData = {
  id: number;
  shape: StickerShape;
  size: number;
  color: string;
  x: number;
  y: number;
};

type ToolMode = "draw" | "sticker";

const TEXT = `The machine does not isolate man from the great problems of nature but plunges him more deeply into them. Technology is the campfire around which we tell our stories. We shape our tools and thereafter our tools shape us. The real problem is not whether machines think but whether men do. Any sufficiently advanced technology is indistinguishable from magic. The art challenges the technology and the technology inspires the art. Man is a slow sloppy and brilliant thinker the machine is fast accurate and stupid. Once a new technology rolls over you if you're not part of the steamroller you're part of the road. Computers are useless they can only give you answers. The human spirit must prevail over technology. It has become appallingly obvious that our technology has exceeded our humanity. The advance of technology is based on making it fit in so that you don't really even notice it so it's part of everyday life. Technology is a useful servant but a dangerous master. The great myth of our times is that technology is communication. We are stuck with technology when what we really want is just stuff that works. Programs must be written for people to read and only incidentally for machines to execute. The most technologically efficient machine that man has ever invented is the book. The science of today is the technology of tomorrow. First we thought the PC was a calculator then we found out how to turn numbers into letters and we thought it was a typewriter then we discovered graphics and we thought it was a television. With all the abundance we have of computers and computing technology it seems like everybody ought to be able to design and create wonderful things. The Web as I envisaged it we have not seen it yet. The future is already here it is just not evenly distributed. Technological progress has merely provided us with more efficient means for going backwards. Science and technology revolutionize our lives but memory tradition and myth frame our response. The Internet is becoming the town square for the global village of tomorrow. Even the technology that promises to unite us divides us. Each of us is now electronically connected to the globe and yet we feel utterly alone. Technology is nothing. What's important is that you have a faith in people that they're basically good and smart and if you give them tools they'll do wonderful things with them. The greatest enemy of knowledge is not ignorance it is the illusion of knowledge. Innovation distinguishes between a leader and a follower. Technology like art is a soaring exercise of the human imagination. The real danger is not that computers will begin to think like men but that men will begin to think like computers. What new technology does is create new opportunities to do a job that customers want done. People who are really serious about software should make their own hardware. The factory of the future will have only two employees a man and a dog. The man will be there to feed the dog. The dog will be there to keep the man from touching the equipment. In the long run we shape our buildings and afterwards our buildings shape us. The production of too many useful things results in too many useless people. Humanity is acquiring all the right technology for all the wrong reasons. It's supposed to be automatic but actually you have to push this button. Technology is the knack of so arranging the world that we don't have to experience it. All of the biggest technological inventions created by man say little about his intelligence but speak volumes about his laziness. We are all now connected by the Internet like neurons in a giant brain. Technology made large populations possible large populations now make technology indispensable. The human condition used to be about birth school work death. Now it seems to be about birth school work retire and fight the algorithms. Soon we will not only be producing knowledge faster than we can comprehend it we will be producing knowledge faster than we can store it. Looking at the proliferation of personal web pages on the net it looks like very soon everyone on earth will have fifteen megabytes of fame. Getting information off the Internet is like taking a drink from a fire hydrant.`;

type Interval = { left: number; right: number };
type PositionedLine = { x: number; y: number; text: string };

function scanBandForBlockedIntervals(
  imageData: ImageData,
  canvasWidth: number,
  bandTop: number,
  bandBottom: number,
  hPad: number,
  vPad: number
): Interval[] {
  const startY = Math.max(0, Math.floor(bandTop - vPad));
  const endY = Math.min(imageData.height - 1, Math.ceil(bandBottom + vPad));
  const data = imageData.data;
  let runLeft = -1;
  let runRight = -1;
  const intervals: Interval[] = [];
  const rowWidth = canvasWidth;
  const opaque = new Uint8Array(rowWidth);

  for (let y = startY; y <= endY; y++) {
    const rowOffset = y * rowWidth * 4;
    for (let x = 0; x < rowWidth; x++) {
      if (data[rowOffset + x * 4 + 3]! > 10) {
        opaque[x] = 1;
      }
    }
  }

  for (let x = 0; x < rowWidth; x++) {
    if (opaque[x]) {
      if (runLeft === -1) runLeft = x;
      runRight = x;
    } else {
      if (runLeft !== -1) {
        intervals.push({ left: runLeft - hPad, right: runRight + 1 + hPad });
        runLeft = -1;
      }
    }
  }
  if (runLeft !== -1) {
    intervals.push({ left: runLeft - hPad, right: runRight + 1 + hPad });
  }

  if (intervals.length <= 1) return intervals;
  intervals.sort((a, b) => a.left - b.left);
  const merged: Interval[] = [intervals[0]!];
  for (let i = 1; i < intervals.length; i++) {
    const curr = intervals[i]!;
    const prev = merged[merged.length - 1]!;
    if (curr.left <= prev.right) {
      prev.right = Math.max(prev.right, curr.right);
    } else {
      merged.push(curr);
    }
  }
  return merged;
}

// Get the horizontal interval a shape occupies at a given y scanline
function getShapeIntervalAtY(
  sticker: StickerData,
  y: number,
  hPad: number
): Interval | null {
  const { x, size, shape } = sticker;
  const cx = x + size / 2;
  const cy = x + size / 2; // unused for some shapes but keeps naming clear
  const s = size;

  switch (shape) {
    case "square": {
      // rect with small rounding — treat as full rect
      const top = sticker.y + s * 0.04;
      const bottom = sticker.y + s * 0.96;
      if (y < top || y > bottom) return null;
      return { left: x + s * 0.04 - hPad, right: x + s * 0.96 + hPad };
    }
    case "circle": {
      const centerX = x + s / 2;
      const centerY = sticker.y + s / 2;
      const r = s * 0.48; // matches r="48" in viewBox 100
      const dy = y - centerY;
      if (Math.abs(dy) > r) return null;
      const dx = Math.sqrt(r * r - dy * dy);
      return { left: centerX - dx - hPad, right: centerX + dx + hPad };
    }
    case "diamond": {
      // diamond: points at (50,2)(98,50)(50,98)(2,50) normalized
      const centerX = x + s / 2;
      const centerY = sticker.y + s / 2;
      const halfW = s * 0.48; // 98-50=48 in 100 units
      const halfH = s * 0.48;
      const dy = Math.abs(y - centerY);
      if (dy > halfH) return null;
      const ratio = 1 - dy / halfH;
      const dx = halfW * ratio;
      return { left: centerX - dx - hPad, right: centerX + dx + hPad };
    }
    case "triangle": {
      // triangle: (50,4)(96,92)(4,92) normalized to size
      const tipY = sticker.y + s * 0.04;
      const baseY = sticker.y + s * 0.92;
      if (y < tipY || y > baseY) return null;
      const t = (y - tipY) / (baseY - tipY); // 0 at tip, 1 at base
      const tipX = x + s * 0.50;
      const baseL = x + s * 0.04;
      const baseR = x + s * 0.96;
      const left = tipX + (baseL - tipX) * t;
      const right = tipX + (baseR - tipX) * t;
      return { left: left - hPad, right: right + hPad };
    }
    case "star": {
      // Use polygon scan for star: points "50,2 61,38 98,38 68,60 79,96 50,74 21,96 32,60 2,38 39,38"
      const pts = [
        [0.50, 0.02], [0.61, 0.38], [0.98, 0.38], [0.68, 0.60], [0.79, 0.96],
        [0.50, 0.74], [0.21, 0.96], [0.32, 0.60], [0.02, 0.38], [0.39, 0.38],
      ];
      const absY = y;
      const localY = (absY - sticker.y) / s;
      if (localY < 0 || localY > 1) return null;

      // Find all x-intersections of polygon edges at this y
      const xs: number[] = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]!;
        const b = pts[(i + 1) % pts.length]!;
        if ((a[1] <= localY && localY < b[1]) || (b[1] <= localY && localY < a[1])) {
          const t = (localY - a[1]) / (b[1] - a[1]);
          xs.push(a[0] + t * (b[0] - a[0]));
        }
      }
      if (xs.length < 2) return null;
      xs.sort((a, b) => a - b);
      const left = x + xs[0]! * s;
      const right = x + xs[xs.length - 1]! * s;
      return { left: left - hPad, right: right + hPad };
    }
  }
}

function getStickerIntervalsForBand(
  stickers: StickerData[],
  bandTop: number,
  bandBottom: number,
  hPad: number,
  vPad: number
): Interval[] {
  const intervals: Interval[] = [];
  // Sample a few y positions in the band and take the union
  const sampleCount = 3;
  for (const sticker of stickers) {
    let left = Infinity;
    let right = -Infinity;
    for (let i = 0; i < sampleCount; i++) {
      const y = bandTop - vPad + ((bandBottom + vPad - (bandTop - vPad)) * (i + 0.5)) / sampleCount;
      const interval = getShapeIntervalAtY(sticker, y, hPad);
      if (interval) {
        if (interval.left < left) left = interval.left;
        if (interval.right > right) right = interval.right;
      }
    }
    if (Number.isFinite(left) && Number.isFinite(right)) {
      intervals.push({ left, right });
    }
  }
  return intervals;
}

function carveTextLineSlots(
  base: Interval,
  blocked: Interval[]
): Interval[] {
  let slots: Interval[] = [base];
  for (const interval of blocked) {
    const next: Interval[] = [];
    for (const slot of slots) {
      if (interval.right <= slot.left || interval.left >= slot.right) {
        next.push(slot);
        continue;
      }
      if (interval.left > slot.left)
        next.push({ left: slot.left, right: interval.left });
      if (interval.right < slot.right)
        next.push({ left: interval.right, right: slot.right });
    }
    slots = next;
  }
  return slots.filter((s) => s.right - s.left >= 24);
}

function layoutWithDrawing(
  prepared: PreparedTextWithSegments,
  regionX: number,
  regionY: number,
  regionW: number,
  regionH: number,
  lineHeight: number,
  columns: number,
  columnGap: number,
  imageData: ImageData | null,
  canvasWidth: number,
  stickerData: StickerData[],
  uiRects: { x: number; y: number; width: number; height: number }[]
): PositionedLine[] {
  const lines: PositionedLine[] = [];
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  const colWidth = (regionW - columnGap * (columns - 1)) / columns;
  let done = false;

  for (let col = 0; col < columns && !done; col++) {
    const colX = regionX + col * (colWidth + columnGap);
    let lineTop = regionY;

    while (lineTop + lineHeight <= regionY + regionH) {
      const bandTop = lineTop;
      const bandBottom = lineTop + lineHeight;

      const blocked: Interval[] = [];

      // Drawing obstacles
      if (imageData) {
        const drawBlocked = scanBandForBlockedIntervals(
          imageData, canvasWidth, bandTop, bandBottom, WRAP_PADDING_H, WRAP_PADDING_V
        );
        for (const b of drawBlocked) blocked.push(b);
      }

      // Sticker obstacles (shape-aware)
      const stickerBlocked = getStickerIntervalsForBand(
        stickerData, bandTop, bandBottom, WRAP_PADDING_H, WRAP_PADDING_V
      );
      for (const b of stickerBlocked) blocked.push(b);

      // UI element obstacles (toolbar, hint)
      for (const rect of uiRects) {
        if (bandBottom <= rect.y - WRAP_PADDING_V || bandTop >= rect.y + rect.height + WRAP_PADDING_V)
          continue;
        blocked.push({ left: rect.x - WRAP_PADDING_H, right: rect.x + rect.width + WRAP_PADDING_H });
      }

      const slots = carveTextLineSlots(
        { left: colX, right: colX + colWidth },
        blocked
      );

      if (slots.length === 0) {
        lineTop += lineHeight;
        continue;
      }

      let advanced = false;
      for (const slot of slots) {
        const slotWidth = slot.right - slot.left;
        const line = layoutNextLine(prepared, cursor, slotWidth);
        if (line === null) {
          done = true;
          break;
        }
        lines.push({
          x: Math.round(slot.left),
          y: Math.round(lineTop),
          text: line.text,
        });
        cursor = line.end;
        advanced = true;
      }

      if (!advanced || done) break;
      lineTop += lineHeight;
    }
  }

  return lines;
}

function getClipPath(shape: StickerShape): string {
  switch (shape) {
    case "circle":
      return "circle(48% at 50% 50%)";
    case "square":
      return "inset(4% round 8%)";
    case "diamond":
      return "polygon(50% 2%, 98% 50%, 50% 98%, 2% 50%)";
    case "triangle":
      return "polygon(50% 4%, 96% 92%, 4% 92%)";
    case "star":
      return "polygon(50% 2%, 61% 38%, 98% 38%, 68% 60%, 79% 96%, 50% 74%, 21% 96%, 32% 60%, 2% 38%, 39% 38%)";
  }
}

function renderStickerShape(shape: StickerShape, color: string, size: number) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: color,
        clipPath: getClipPath(shape),
      }}
    />
  );
}

let nextStickerId = 0;

export default function PretextDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const linesContainerRef = useRef<HTMLDivElement>(null);
  const stickersContainerRef = useRef<HTMLDivElement>(null);
  const preparedRef = useRef<PreparedTextWithSegments | null>(null);
  const linePoolRef = useRef<HTMLSpanElement[]>([]);
  const rafRef = useRef<number>(0);
  const needsLayoutRef = useRef(true);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const draggablesRef = useRef<Map<number, Draggable[]>>(new Map());
  const toolbarRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const [toolMode, setToolMode] = useState<ToolMode>("draw");
  const [brushColor, setBrushColor] = useState(COLORS[0]!);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[2]!);
  const [stickerShape, setStickerShape] = useState<StickerShape>("circle");
  const [stickerSize, setStickerSize] = useState(STICKER_SIZES[1]!.size);
  const [stickerColor, setStickerColor] = useState(COLORS[0]!);
  const [stickers, setStickers] = useState<StickerData[]>([]);

  const brushColorRef = useRef(brushColor);
  brushColorRef.current = brushColor;
  const brushSizeRef = useRef(brushSize);
  brushSizeRef.current = brushSize;
  const stickersRef = useRef(stickers);
  stickersRef.current = stickers;

  const doLayout = useCallback(() => {
    const prepared = preparedRef.current;
    const linesContainer = linesContainerRef.current;
    const drawCanvas = drawCanvasRef.current;
    if (!prepared || !linesContainer || !drawCanvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const ctx = drawCanvas.getContext("2d", { willReadFrequently: true })!;
    const imageData = ctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);

    // Gather UI element rects
    const uiRects: { x: number; y: number; width: number; height: number }[] = [];
    if (toolbarRef.current) {
      const r = toolbarRef.current.getBoundingClientRect();
      uiRects.push({ x: r.left, y: r.top, width: r.width, height: r.height });
    }
    if (hintRef.current) {
      const r = hintRef.current.getBoundingClientRect();
      uiRects.push({ x: r.left, y: r.top, width: r.width, height: r.height });
    }

    const lines = layoutWithDrawing(
      prepared,
      PADDING,
      TOP_PADDING,
      w - PADDING * 2,
      h - TOP_PADDING - PADDING,
      LINE_HEIGHT,
      COLUMNS,
      COLUMN_GAP,
      imageData,
      drawCanvas.width,
      stickersRef.current,
      uiRects
    );

    const pool = linePoolRef.current;
    while (pool.length < lines.length) {
      const span = document.createElement("span");
      span.style.position = "absolute";
      span.style.whiteSpace = "pre";
      span.style.font = FONT;
      span.style.color = "#000";
      span.style.lineHeight = `${LINE_HEIGHT}px`;
      span.style.pointerEvents = "none";
      pool.push(span);
      linesContainer.appendChild(span);
    }
    while (pool.length > lines.length) {
      pool.pop()!.remove();
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const span = pool[i]!;
      span.style.left = `${line.x}px`;
      span.style.top = `${line.y}px`;
      if (span.textContent !== line.text) span.textContent = line.text;
    }
  }, []);

  const drawStroke = useCallback((x: number, y: number) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const last = lastPointRef.current;
    const r = brushSizeRef.current;

    ctx.strokeStyle = brushColorRef.current;
    ctx.fillStyle = brushColorRef.current;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = r * 2;

    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPointRef.current = { x, y };
    needsLayoutRef.current = true;
  }, []);

  const addSticker = useCallback(() => {
    const id = nextStickerId++;
    const cx = window.innerWidth / 2 - stickerSize / 2 + Math.random() * 100 - 50;
    const cy = window.innerHeight / 2 - stickerSize / 2 + Math.random() * 100 - 50;
    const newSticker: StickerData = {
      id,
      shape: stickerShape,
      size: stickerSize,
      color: stickerColor,
      x: cx,
      y: cy,
    };
    setStickers((prev) => [...prev, newSticker]);
    needsLayoutRef.current = true;
  }, [stickerShape, stickerSize, stickerColor]);

  const removeSticker = useCallback((id: number) => {
    const drags = draggablesRef.current.get(id);
    if (drags) {
      drags.forEach((d) => d.kill());
      draggablesRef.current.delete(id);
    }
    setStickers((prev) => prev.filter((s) => s.id !== id));
    needsLayoutRef.current = true;
  }, []);

  // Initialize GSAP Draggable for new stickers
  useEffect(() => {
    const container = stickersContainerRef.current;
    if (!container) return;

    stickers.forEach((sticker) => {
      if (draggablesRef.current.has(sticker.id)) return;
      const el = container.querySelector(`[data-sticker-id="${sticker.id}"]`) as HTMLElement;
      if (!el) return;

      gsap.set(el, { x: sticker.x, y: sticker.y });

      const drags = Draggable.create(el, {
        type: "x,y",
        bounds: containerRef.current,
        onDrag: function () {
          setStickers((prev) =>
            prev.map((s) =>
              s.id === sticker.id ? { ...s, x: this.x, y: this.y } : s
            )
          );
          needsLayoutRef.current = true;
        },
      });
      draggablesRef.current.set(sticker.id, drags);
    });
  }, [stickers]);

  useEffect(() => {
    const estimatedChars = Math.ceil(
      ((window.innerWidth * window.innerHeight) / (FONT_SIZE * 0.6)) * 1.5
    );
    let fullText = TEXT;
    while (fullText.length < estimatedChars) {
      fullText += " " + TEXT;
    }
    preparedRef.current = prepareWithSegments(fullText, FONT);

    const canvas = drawCanvasRef.current!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    needsLayoutRef.current = true;

    function tick() {
      if (needsLayoutRef.current) {
        needsLayoutRef.current = false;
        doLayout();
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => {
      const ctx = canvas.getContext("2d")!;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.putImageData(imgData, 0, 0);
      needsLayoutRef.current = true;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [doLayout]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (toolMode !== "draw") return;
      isDrawingRef.current = true;
      lastPointRef.current = null;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      drawStroke(e.clientX, e.clientY);
    },
    [drawStroke, toolMode]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current) return;
      drawStroke(e.clientX, e.clientY);
    },
    [drawStroke]
  );

  const onPointerUp = useCallback(() => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    needsLayoutRef.current = true;
  }, []);

  const clearAll = useCallback(() => {
    clearCanvas();
    draggablesRef.current.forEach((drags) => drags.forEach((d) => d.kill()));
    draggablesRef.current.clear();
    setStickers([]);
    needsLayoutRef.current = true;
  }, [clearCanvas]);

  const btnStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.06)",
    color: "#000",
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "inherit",
    transition: "background 0.15s",
  };

  const btnActiveStyle: React.CSSProperties = {
    ...btnStyle,
    background: "rgba(0,0,0,0.14)",
  };

  const divider = (
    <div
      style={{
        width: 1,
        height: 20,
        background: "rgba(0,0,0,0.12)",
        margin: "0 2px",
        flexShrink: 0,
      }}
    />
  );

  return (
    <main
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#FAFAFA",
        overflow: "hidden",
      }}
    >
      <div ref={linesContainerRef} />

      {/* Drawing canvas — only captures input in draw mode */}
      <canvas
        ref={drawCanvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          cursor: toolMode === "draw" ? "crosshair" : "default",
          zIndex: toolMode === "draw" ? 10 : 5,
          pointerEvents: toolMode === "draw" ? "auto" : "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />

      {/* Stickers layer */}
      <div
        ref={stickersContainerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: toolMode === "sticker" ? 10 : 8,
          pointerEvents: toolMode === "sticker" ? "auto" : "none",
        }}
      >
        {stickers.map((s) => (
          <div
            key={s.id}
            data-sticker-id={s.id}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: s.size,
              height: s.size,
              clipPath: getClipPath(s.shape),
              cursor: "grab",
              userSelect: "none",
              touchAction: "none",
              pointerEvents: "auto",
            }}
            onDoubleClick={() => removeSticker(s.id)}
          >
            {renderStickerShape(s.shape, s.color, s.size)}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div
        ref={toolbarRef}
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(240, 240, 240, 0.9)",
          backdropFilter: "blur(12px)",
          borderRadius: 14,
          padding: "10px 16px",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Mode toggle */}
        <button
          onClick={() => setToolMode("draw")}
          style={toolMode === "draw" ? btnActiveStyle : btnStyle}
        >
          Draw
        </button>
        <button
          onClick={() => setToolMode("sticker")}
          style={toolMode === "sticker" ? btnActiveStyle : btnStyle}
        >
          Sticker
        </button>

        {divider}

        {/* Color palette */}
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => {
              if (toolMode === "draw") setBrushColor(color);
              else setStickerColor(color);
            }}
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: color,
              border:
                (toolMode === "draw" ? brushColor : stickerColor) === color
                  ? "2.5px solid #000"
                  : color === "#000000"
                    ? "1.5px solid rgba(0,0,0,0.2)"
                    : "1.5px solid transparent",
              cursor: "pointer",
              padding: 0,
              outline: "none",
              transition: "border-color 0.15s",
              flexShrink: 0,
              boxShadow: color === "#ffffff" ? "inset 0 0 0 1px rgba(0,0,0,0.1)" : "none",
            }}
          />
        ))}

        {divider}

        {/* Draw-mode options: brush size */}
        {toolMode === "draw" && (
          <>
            {BRUSH_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                style={{
                  ...btnStyle,
                  width: 32,
                  height: 32,
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    brushSize === size ? "rgba(0,0,0,0.14)" : "rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    width: Math.max(4, size),
                    height: Math.max(4, size),
                    borderRadius: "50%",
                    background: "#000",
                  }}
                />
              </button>
            ))}
          </>
        )}

        {/* Sticker-mode options: shape, size, add */}
        {toolMode === "sticker" && (
          <>
            {STICKER_SHAPES.map(({ shape, label }) => (
              <button
                key={shape}
                onClick={() => setStickerShape(shape)}
                style={{
                  ...(stickerShape === shape ? btnActiveStyle : btnStyle),
                  width: 32,
                  height: 32,
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={label}
              >
                <div style={{ width: 18, height: 18 }}>
                  {renderStickerShape(shape, "#000", 18)}
                </div>
              </button>
            ))}

            {divider}

            {STICKER_SIZES.map(({ label, size }) => (
              <button
                key={label}
                onClick={() => setStickerSize(size)}
                style={stickerSize === size ? btnActiveStyle : btnStyle}
              >
                {label}
              </button>
            ))}

            {divider}

            <button
              onClick={addSticker}
              style={{
                ...btnStyle,
                background: stickerColor,
                color: ["#000000", "#8b5cf6", "#3b82f6", "#ef4444"].includes(stickerColor)
                  ? "#fff"
                  : "#000",
                fontWeight: 600,
              }}
            >
              + Add
            </button>
          </>
        )}

        {divider}

        <button
          onClick={clearCanvas}
          style={btnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
        >
          Clear Paint
        </button>
        <button
          onClick={clearAll}
          style={btnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
        >
          Clear All
        </button>
      </div>

      {/* Hint */}
      {stickers.length > 0 && toolMode === "sticker" && (
        <div
          ref={hintRef}
          style={{
            position: "fixed",
            bottom: 78,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            fontSize: 12,
            color: "rgba(0,0,0,0.35)",
            pointerEvents: "none",
          }}
        >
          Drag stickers to move. Double-click to remove.
        </div>
      )}
    </main>
  );
}
