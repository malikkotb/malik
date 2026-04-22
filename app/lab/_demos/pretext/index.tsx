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
const TOP_PADDING = 60;
function getColumns(width: number) {
  if (width < 640) return 1;
  if (width < 768) return 2;
  if (width < 991) return 3;
  return 4;
}
const COLUMN_GAP = 24;
const WRAP_PADDING_H = 6;
const WRAP_PADDING_V = 1;
const IMAGE_MAX_WIDTH = 250;



type StickerShape = "circle" | "square" | "diamond" | "triangle" | "star";

const STICKER_SHAPES: { shape: StickerShape; label: string }[] = [
  { shape: "circle", label: "Circle" },
  { shape: "square", label: "Square" },
  { shape: "diamond", label: "Diamond" },
  { shape: "triangle", label: "Triangle" },
  { shape: "star", label: "Star" },
];


type StickerData = {
  id: number;
  shape: StickerShape;
  size: number;
  color: string;
  x: number;
  y: number;
};

type ImageItem = {
  id: number;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  naturalAspect: number; // width / height
};

type ToolMode = "draw" | "sticker" | "image";
type BrushType = "round" | "pixel";

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

function getShapeIntervalAtY(
  sticker: StickerData,
  y: number,
  hPad: number
): Interval | null {
  const { x, size, shape } = sticker;
  const cx = x + size / 2;
  const cy = x + size / 2;
  const s = size;

  switch (shape) {
    case "square": {
      const top = sticker.y + s * 0.04;
      const bottom = sticker.y + s * 0.96;
      if (y < top || y > bottom) return null;
      return { left: x + s * 0.04 - hPad, right: x + s * 0.96 + hPad };
    }
    case "circle": {
      const centerX = x + s / 2;
      const centerY = sticker.y + s / 2;
      const r = s * 0.48;
      const dy = y - centerY;
      if (Math.abs(dy) > r) return null;
      const dx = Math.sqrt(r * r - dy * dy);
      return { left: centerX - dx - hPad, right: centerX + dx + hPad };
    }
    case "diamond": {
      const centerX = x + s / 2;
      const centerY = sticker.y + s / 2;
      const halfW = s * 0.48;
      const halfH = s * 0.48;
      const dy = Math.abs(y - centerY);
      if (dy > halfH) return null;
      const ratio = 1 - dy / halfH;
      const dx = halfW * ratio;
      return { left: centerX - dx - hPad, right: centerX + dx + hPad };
    }
    case "triangle": {
      const tipY = sticker.y + s * 0.04;
      const baseY = sticker.y + s * 0.92;
      if (y < tipY || y > baseY) return null;
      const t = (y - tipY) / (baseY - tipY);
      const tipX = x + s * 0.50;
      const baseL = x + s * 0.04;
      const baseR = x + s * 0.96;
      const left = tipX + (baseL - tipX) * t;
      const right = tipX + (baseR - tipX) * t;
      return { left: left - hPad, right: right + hPad };
    }
    case "star": {
      const pts = [
        [0.50, 0.02], [0.61, 0.38], [0.98, 0.38], [0.68, 0.60], [0.79, 0.96],
        [0.50, 0.74], [0.21, 0.96], [0.32, 0.60], [0.02, 0.38], [0.39, 0.38],
      ];
      const absY = y;
      const localY = (absY - sticker.y) / s;
      if (localY < 0 || localY > 1) return null;

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

function getAlphaShapeIntervalsForBand(
  img: ImageItem,
  alphaData: ImageData,
  bandTop: number,
  bandBottom: number,
  hPad: number,
  vPad: number,
  threshold: number
): Interval[] {
  const { x: imgX, y: imgY, width: imgW, height: imgH } = img;
  const naturalW = alphaData.width;
  const naturalH = alphaData.height;
  const scaleX = naturalW / imgW;
  const scaleY = naturalH / imgH;

  const startY = Math.max(0, Math.floor((bandTop - vPad - imgY) * scaleY));
  const endY = Math.min(naturalH - 1, Math.ceil((bandBottom + vPad - imgY) * scaleY));

  if (startY > endY) return [];

  const thresholdAlpha = threshold * 255;
  const opaque = new Uint8Array(naturalW);
  const data = alphaData.data;

  for (let py = startY; py <= endY; py++) {
    const rowOffset = py * naturalW * 4;
    for (let px = 0; px < naturalW; px++) {
      if (data[rowOffset + px * 4 + 3]! > thresholdAlpha) {
        opaque[px] = 1;
      }
    }
  }

  const intervals: Interval[] = [];
  let runLeft = -1;
  let runRight = -1;

  for (let px = 0; px < naturalW; px++) {
    if (opaque[px]) {
      if (runLeft === -1) runLeft = px;
      runRight = px;
    } else {
      if (runLeft !== -1) {
        intervals.push({
          left: imgX + runLeft / scaleX - hPad,
          right: imgX + (runRight + 1) / scaleX + hPad,
        });
        runLeft = -1;
      }
    }
  }
  if (runLeft !== -1) {
    intervals.push({
      left: imgX + runLeft / scaleX - hPad,
      right: imgX + (runRight + 1) / scaleX + hPad,
    });
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

function getImageIntervalsForBand(
  images: ImageItem[],
  alphaDataMap: Map<number, ImageData>,
  bandTop: number,
  bandBottom: number,
  hPad: number,
  vPad: number,
  threshold: number
): Interval[] {
  const intervals: Interval[] = [];
  for (const img of images) {
    if (img.height === 0) continue;
    if (bandBottom <= img.y - vPad || bandTop >= img.y + img.height + vPad) continue;
    const alphaData = alphaDataMap.get(img.id);
    if (alphaData) {
      const alphaIntervals = getAlphaShapeIntervalsForBand(
        img, alphaData, bandTop, bandBottom, hPad, vPad, threshold
      );
      for (const interval of alphaIntervals) intervals.push(interval);
    } else {
      intervals.push({ left: img.x - hPad, right: img.x + img.width + hPad });
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
  imageItems: ImageItem[],
  uiRects: { x: number; y: number; width: number; height: number }[],
  alphaDataMap: Map<number, ImageData>,
  shapeImageThreshold: number
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

      if (imageData) {
        const drawBlocked = scanBandForBlockedIntervals(
          imageData, canvasWidth, bandTop, bandBottom, WRAP_PADDING_H, WRAP_PADDING_V
        );
        for (const b of drawBlocked) blocked.push(b);
      }

      const stickerBlocked = getStickerIntervalsForBand(
        stickerData, bandTop, bandBottom, WRAP_PADDING_H, WRAP_PADDING_V
      );
      for (const b of stickerBlocked) blocked.push(b);

      const imageBlocked = getImageIntervalsForBand(
        imageItems, alphaDataMap, bandTop, bandBottom, WRAP_PADDING_H, WRAP_PADDING_V, shapeImageThreshold
      );
      for (const b of imageBlocked) blocked.push(b);

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

const TEXT = `The machine does not isolate man from the great problems of nature but plunges him more deeply into them. Technology is the campfire around which we tell our stories. We shape our tools and thereafter our tools shape us. The real problem is not whether machines think but whether men do. Any sufficiently advanced technology is indistinguishable from magic. The art challenges the technology and the technology inspires the art. Man is a slow sloppy and brilliant thinker the machine is fast accurate and stupid. Once a new technology rolls over you if you're not part of the steamroller you're part of the road. Computers are useless they can only give you answers. The human spirit must prevail over technology. It has become appallingly obvious that our technology has exceeded our humanity. The advance of technology is based on making it fit in so that you don't really even notice it so it's part of everyday life. Technology is a useful servant but a dangerous master. The great myth of our times is that technology is communication. We are stuck with technology when what we really want is just stuff that works. Programs must be written for people to read and only incidentally for machines to execute. The most technologically efficient machine that man has ever invented is the book. The science of today is the technology of tomorrow. First we thought the PC was a calculator then we found out how to turn numbers into letters and we thought it was a typewriter then we discovered graphics and we thought it was a television. With all the abundance we have of computers and computing technology it seems like everybody ought to be able to design and create wonderful things. The Web as I envisaged it we have not seen it yet. The future is already here it is just not evenly distributed. Technological progress has merely provided us with more efficient means for going backwards. Science and technology revolutionize our lives but memory tradition and myth frame our response. The Internet is becoming the town square for the global village of tomorrow. Even the technology that promises to unite us divides us. Each of us is now electronically connected to the globe and yet we feel utterly alone. Technology is nothing. What's important is that you have a faith in people that they're basically good and smart and if you give them tools they'll do wonderful things with them. The greatest enemy of knowledge is not ignorance it is the illusion of knowledge. Innovation distinguishes between a leader and a follower. Technology like art is a soaring exercise of the human imagination. The real danger is not that computers will begin to think like men but that men will begin to think like computers. What new technology does is create new opportunities to do a job that customers want done. People who are really serious about software should make their own hardware. The factory of the future will have only two employees a man and a dog. The man will be there to feed the dog. The dog will be there to keep the man from touching the equipment. In the long run we shape our buildings and afterwards our buildings shape us. The production of too many useful things results in too many useless people. Humanity is acquiring all the right technology for all the wrong reasons. It's supposed to be automatic but actually you have to push this button. Technology is the knack of so arranging the world that we don't have to experience it. All of the biggest technological inventions created by man say little about his intelligence but speak volumes about his laziness. We are all now connected by the Internet like neurons in a giant brain. Technology made large populations possible large populations now make technology indispensable. The human condition used to be about birth school work death. Now it seems to be about birth school work retire and fight the algorithms. Soon we will not only be producing knowledge faster than we can comprehend it we will be producing knowledge faster than we can store it. Looking at the proliferation of personal web pages on the net it looks like very soon everyone on earth will have fifteen megabytes of fame. Getting information off the Internet is like taking a drink from a fire hydrant. The Internet is the first thing that humanity has built that humanity doesn't understand the largest experiment in anarchy that we have ever had. To invent you need a good imagination and a pile of junk. The real voyage of discovery consists not in seeking new landscapes but in having new eyes. Simplicity is the ultimate sophistication. Design is not just what it looks like and feels like design is how it works. Everything is designed few things are designed well. Good design is obvious great design is transparent. The details are not the details they make the design. Design is thinking made visual. A designer knows he has achieved perfection not when there is nothing left to add but when there is nothing left to take away. Order is not pressure which is imposed on society from without but an equilibrium which is set up from within. Design is where science and art break even. The function of design is letting design function. To design is to communicate clearly by whatever means you can control or master. Style is the substance of the subject calling itself what it is. Less is more. Perfection is achieved not when there is nothing more to add but when there is nothing more to remove. The best design is the simplest one that works. It is not enough that we build products that function that are understandable and usable we also need to build products that bring joy and excitement pleasure and fun and yes beauty to people's lives. Design is an opportunity to continue telling the story not just to sum everything up. I strive for two things in design simplicity and clarity. Great design is a multi-layered relationship between human life and its environment. Color does not add a pleasant quality to design it reinforces it. Content precedes design design in the absence of content is not design it is decoration. You can have an art experience in front of a Rembrandt or in front of a piece of graphic design. Design should never say look at me it should always say look at this. The life of a designer is a life of fight fight against the ugliness. We have an obligation to make things beautiful not to dump more garbage into the world. Good design is good business. Design must seduce shape and perhaps more importantly evoke a response. Most people make the mistake of thinking design is what it looks like. Typography is what language looks like. White space is to be regarded as an active element not a passive background. Negative space is not empty space it is an element of design. Every great design begins with an even better story. A good logo is the beginning of a language from which to communicate and distinguish an organization. Innovation is seeing what everybody has seen and thinking what nobody has thought. Creativity is intelligence having fun. Logic will get you from A to Z imagination will get you everywhere. The true sign of intelligence is not knowledge but imagination. You cannot use up creativity the more you use the more you have. Creativity involves breaking out of established patterns in order to look at things in a different way. The creative adult is the child who survived. To be creative means to be in love with life. Creativity requires the courage to let go of certainties. Every child is an artist the problem is how to remain an artist once we grow up. Art is not what you see but what you make others see. The purpose of art is washing the dust of daily life off our souls. Art enables us to find ourselves and lose ourselves at the same time. Without deviation from the norm progress is not possible. The creation of something new is not accomplished by the intellect but by the play instinct. An idea that is not dangerous is unworthy of being called an idea at all. There is no innovation and creativity without failure period. Fall seven times stand up eight. The secret of getting ahead is getting started. Do not wait to strike till the iron is hot but make it hot by striking.`;

// Demo: Digital Scrapbook — drag images/stickers/drawings, text wraps around shapes
export default function PretextDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const linesContainerRef = useRef<HTMLDivElement>(null);
  const stickersContainerRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const preparedRef = useRef<PreparedTextWithSegments | null>(null);
  const linePoolRef = useRef<HTMLSpanElement[]>([]);
  const rafRef = useRef<number>(0);
  const needsLayoutRef = useRef(true);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const draggablesRef = useRef<Map<number, Draggable[]>>(new Map());
  const imageDraggablesRef = useRef<Map<number, Draggable[]>>(new Map());
  const toolbarRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Map<number, string>>(new Map());
  const imageAlphaDataRef = useRef<Map<number, ImageData>>(new Map());
  const nextIdRef = useRef(0);

  const [toolMode, setToolMode] = useState<ToolMode>("draw");
  const [brushColor, setBrushColor] = useState("#22c55e");
  const [brushHexDraft, setBrushHexDraft] = useState("#22c55e");
  const [brushSize, setBrushSize] = useState(14);
  const [brushType, setBrushType] = useState<BrushType>("round");
  const [isEraser, setIsEraser] = useState(false);
  const [stickerShape, setStickerShape] = useState<StickerShape>("circle");
  const [stickerSize, setStickerSize] = useState(140);
  const [stickerColor, setStickerColor] = useState("#22c55e");
  const [stickerHexDraft, setStickerHexDraft] = useState("#22c55e");
  const [stickers, setStickers] = useState<StickerData[]>([]);
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [hoveredImageId, setHoveredImageId] = useState<number | null>(null);
  const [shapeImageThreshold, setShapeImageThreshold] = useState(0.5);
  const [customText, setCustomText] = useState(TEXT);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editorDraft, setEditorDraft] = useState(TEXT);

  const shapeImageThresholdRef = useRef(shapeImageThreshold);
  shapeImageThresholdRef.current = shapeImageThreshold;

  const brushColorRef = useRef(brushColor);
  brushColorRef.current = brushColor;
  const brushSizeRef = useRef(brushSize);
  brushSizeRef.current = brushSize;
  const brushTypeRef = useRef(brushType);
  brushTypeRef.current = brushType;
  const isEraserRef = useRef(isEraser);
  isEraserRef.current = isEraser;
  const stickersRef = useRef(stickers);
  stickersRef.current = stickers;
  const imageItemsRef = useRef(imageItems);
  imageItemsRef.current = imageItems;

  const doLayout = useCallback(() => {
    const prepared = preparedRef.current;
    const linesContainer = linesContainerRef.current;
    const drawCanvas = drawCanvasRef.current;
    if (!prepared || !linesContainer || !drawCanvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const ctx = drawCanvas.getContext("2d", { willReadFrequently: true })!;
    const imageData = ctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);

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
      getColumns(w),
      COLUMN_GAP,
      imageData,
      drawCanvas.width,
      stickersRef.current,
      imageItemsRef.current,
      uiRects,
      imageAlphaDataRef.current,
      shapeImageThresholdRef.current
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

  const pixelVisitedRef = useRef<Set<string>>(new Set());

  const drawStroke = useCallback((x: number, y: number) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const last = lastPointRef.current;
    const r = brushSizeRef.current;
    const type = brushTypeRef.current;
    const erasing = isEraserRef.current;

    if (erasing) {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
    }

    ctx.strokeStyle = brushColorRef.current;
    ctx.fillStyle = brushColorRef.current;

    if (type === "pixel") {
      const size = r * 2;
      const stampPixel = (px: number, py: number) => {
        const sx = Math.floor(px / size) * size;
        const sy = Math.floor(py / size) * size;
        const key = `${sx},${sy}`;
        if (pixelVisitedRef.current.has(key)) return;
        pixelVisitedRef.current.add(key);
        ctx.fillRect(sx, sy, size, size);
      };

      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.ceil(dist / (size * 0.5)));
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          stampPixel(last.x + dx * t, last.y + dy * t);
        }
      } else {
        stampPixel(x, y);
      }
    } else {
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
    }

    ctx.globalCompositeOperation = "source-over";
    lastPointRef.current = { x, y };
    needsLayoutRef.current = true;
  }, []);

  const addSticker = useCallback(() => {
    const id = nextIdRef.current++;
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

  const handleImageUpload = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      const id = nextIdRef.current++;
      const cx = window.innerWidth / 2 - IMAGE_MAX_WIDTH / 2 + Math.random() * 60 - 30;
      const cy = window.innerHeight / 2 - 100 + Math.random() * 60 - 30;
      objectUrlsRef.current.set(id, url);
      setImageItems((prev) => [...prev, { id, src: url, x: cx, y: cy, width: IMAGE_MAX_WIDTH, height: 0, naturalAspect: 1 }]);
      needsLayoutRef.current = true;
    });
  }, []);

  const onResizeStart = useCallback((
    e: React.PointerEvent,
    corner: "tl" | "tr" | "bl" | "br",
    img: ImageItem
  ) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startWidth = img.width;
    const startHeight = img.height;
    const startImgX = img.x;
    const startImgY = img.y;
    const aspect = img.naturalAspect; // width / height

    const onMove = (me: PointerEvent) => {
      const dx = me.clientX - startClientX;

      let newWidth: number;
      let newX = startImgX;
      let newY = startImgY;

      if (corner === "br" || corner === "tr") {
        newWidth = Math.max(60, startWidth + dx);
      } else {
        // bl, tl — left edge moves, x shifts
        newWidth = Math.max(60, startWidth - dx);
        newX = startImgX + (startWidth - newWidth);
      }

      const newHeight = aspect > 0 ? newWidth / aspect : newWidth;

      if (corner === "tl" || corner === "tr") {
        // top edge moves up, y shifts to keep bottom fixed
        newY = startImgY + (startHeight - newHeight);
      }

      setImageItems((prev) =>
        prev.map((item) =>
          item.id === img.id
            ? { ...item, width: Math.round(newWidth), height: Math.round(newHeight), x: newX, y: newY }
            : item
        )
      );

      // Sync GSAP Draggable position when x/y changed
      if (corner === "tl" || corner === "bl" || corner === "tr") {
        const container = imagesContainerRef.current;
        if (container) {
          const el = container.querySelector(`[data-image-id="${img.id}"]`) as HTMLElement;
          if (el) {
            gsap.set(el, { x: newX, y: newY });
            imageDraggablesRef.current.get(img.id)?.[0]?.update();
          }
        }
      }

      needsLayoutRef.current = true;
    };

    setHoveredImageId(img.id); // keep handles visible during resize

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const removeSticker = useCallback((id: number) => {
    const drags = draggablesRef.current.get(id);
    if (drags) {
      drags.forEach((d) => d.kill());
      draggablesRef.current.delete(id);
    }
    setStickers((prev) => prev.filter((s) => s.id !== id));
    needsLayoutRef.current = true;
  }, []);

  const removeImage = useCallback((id: number) => {
    const drags = imageDraggablesRef.current.get(id);
    if (drags) {
      drags.forEach((d) => d.kill());
      imageDraggablesRef.current.delete(id);
    }
    const url = objectUrlsRef.current.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(id);
    }
    imageAlphaDataRef.current.delete(id);
    setImageItems((prev) => prev.filter((img) => img.id !== id));
    needsLayoutRef.current = true;
  }, []);

  // GSAP Draggable for stickers
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

  // GSAP Draggable for images
  useEffect(() => {
    const container = imagesContainerRef.current;
    if (!container) return;

    imageItems.forEach((img) => {
      if (imageDraggablesRef.current.has(img.id)) return;
      const el = container.querySelector(`[data-image-id="${img.id}"]`) as HTMLElement;
      if (!el) return;

      gsap.set(el, { x: img.x, y: img.y });

      const drags = Draggable.create(el, {
        type: "x,y",
        bounds: containerRef.current,
        onPress: function (e: PointerEvent) {
          if ((e.target as HTMLElement).closest("[data-resize-handle]")) {
            this.endDrag(e);
          }
        },
        onDrag: function () {
          setImageItems((prev) =>
            prev.map((item) =>
              item.id === img.id ? { ...item, x: this.x, y: this.y } : item
            )
          );
          needsLayoutRef.current = true;
        },
      });
      imageDraggablesRef.current.set(img.id, drags);
    });
  }, [imageItems]);

  useEffect(() => {
    preparedRef.current = prepareWithSegments(customText, FONT);
    needsLayoutRef.current = true;
  }, [customText]);

  useEffect(() => {
    needsLayoutRef.current = true;
  }, [shapeImageThreshold]);

  useEffect(() => {
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

    const onPaste = (e: ClipboardEvent) => {
      const files: File[] = [];
      for (const item of Array.from(e.clipboardData?.items ?? [])) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) handleImageUpload(files);
    };
    window.addEventListener("paste", onPaste);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("paste", onPaste);
    };
  }, [doLayout, handleImageUpload]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (toolMode !== "draw") return;
      isDrawingRef.current = true;
      lastPointRef.current = null;
      pixelVisitedRef.current.clear();
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
    imageDraggablesRef.current.forEach((drags) => drags.forEach((d) => d.kill()));
    imageDraggablesRef.current.clear();
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
    imageAlphaDataRef.current.clear();
    setImageItems([]);
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

      {/* Drawing canvas */}
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

      {/* Images layer */}
      <div
        ref={imagesContainerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: toolMode === "image" ? 10 : 8,
          pointerEvents: toolMode === "image" ? "auto" : "none",
        }}
      >
        {imageItems.map((img) => (
          <div
            key={img.id}
            data-image-id={img.id}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              cursor: "grab",
              userSelect: "none",
              touchAction: "none",
              pointerEvents: "auto",
            }}
            onDoubleClick={() => removeImage(img.id)}
            onMouseEnter={() => setHoveredImageId(img.id)}
            onMouseLeave={() => setHoveredImageId(null)}
          >
            {/* Corner resize handles — only visible on hover */}
            {img.height > 0 && hoveredImageId === img.id && (["tl", "tr", "bl", "br"] as const).map((corner) => (
              <div
                key={corner}
                data-resize-handle="true"
                onPointerDown={(e) => onResizeStart(e, corner, img)}
                style={{
                  position: "absolute",
                  width: 10,
                  height: 10,
                  background: "#fff",
                  border: "1.5px solid rgba(0,0,0,0.45)",
                  borderRadius: 2,
                  zIndex: 2,
                  cursor: corner === "tl" || corner === "br" ? "nwse-resize" : "nesw-resize",
                  ...(corner === "tl" && { top: -5, left: -5 }),
                  ...(corner === "tr" && { top: -5, right: -5 }),
                  ...(corner === "bl" && { bottom: -5, left: -5 }),
                  ...(corner === "br" && { bottom: -5, right: -5 }),
                }}
              />
            ))}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt=""
              draggable={false}
              style={{
                display: "block",
                width: img.height > 0 ? img.width : IMAGE_MAX_WIDTH,
                height: "auto",
                pointerEvents: "none",
                userSelect: "none",
              }}
              onLoad={(e) => {
                const el = e.currentTarget;
                const aspect = el.naturalWidth / el.naturalHeight;
                const h = IMAGE_MAX_WIDTH / aspect;
                // Extract alpha channel for shape-outside-style wrapping
                try {
                  const offscreen = document.createElement("canvas");
                  offscreen.width = el.naturalWidth;
                  offscreen.height = el.naturalHeight;
                  const ctx2d = offscreen.getContext("2d")!;
                  ctx2d.drawImage(el, 0, 0);
                  const alphaData = ctx2d.getImageData(0, 0, el.naturalWidth, el.naturalHeight);
                  imageAlphaDataRef.current.set(img.id, alphaData);
                } catch {
                  // Cross-origin or tainted canvas — fall back to rect wrapping
                }
                setImageItems((prev) =>
                  prev.map((item) =>
                    item.id === img.id
                      ? { ...item, width: IMAGE_MAX_WIDTH, height: Math.round(h), naturalAspect: aspect }
                      : item
                  )
                );
                needsLayoutRef.current = true;
              }}
            />
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
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 8,
          width: "calc(100vw - 48px)",
          maxWidth: 1000,
          background: "rgba(240, 240, 240, 0.9)",
          backdropFilter: "blur(12px)",
          borderRadius: 14,
          padding: "10px 16px",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Mode toggle */}
        <button onClick={() => setToolMode("draw")} style={toolMode === "draw" ? btnActiveStyle : btnStyle}>
          Draw
        </button>
        <button onClick={() => setToolMode("sticker")} style={toolMode === "sticker" ? btnActiveStyle : btnStyle}>
          Sticker
        </button>
        <button onClick={() => setToolMode("image")} style={toolMode === "image" ? btnActiveStyle : btnStyle}>
          Image
        </button>

        {divider}

        {/* Color picker — only for draw/sticker modes, hidden when eraser active */}
        {toolMode !== "image" && !(toolMode === "draw" && isEraser) && (() => {
          const activeColor = toolMode === "draw" ? brushColor : stickerColor;
          const hexDraft = toolMode === "draw" ? brushHexDraft : stickerHexDraft;
          const setColor = (c: string) => {
            if (toolMode === "draw") { setBrushColor(c); setBrushHexDraft(c); }
            else { setStickerColor(c); setStickerHexDraft(c); }
          };
          const setDraft = (v: string) => {
            if (toolMode === "draw") setBrushHexDraft(v);
            else setStickerHexDraft(v);
          };
          return (
            <>
              {/* Color wheel swatch */}
              <label style={{ position: "relative", width: 26, height: 26, flexShrink: 0, cursor: "pointer" }}>
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: activeColor,
                  border: "2px solid rgba(0,0,0,0.2)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)",
                  pointerEvents: "none",
                }} />
                <input
                  type="color"
                  value={activeColor}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, cursor: "pointer" }}
                />
              </label>
              {/* Hex input */}
              <input
                type="text"
                value={hexDraft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setColor(e.target.value);
                }}
                onBlur={() => setDraft(activeColor)}
                maxLength={7}
                style={{
                  width: 72,
                  fontSize: 12,
                  fontFamily: "monospace",
                  border: "1px solid rgba(0,0,0,0.15)",
                  borderRadius: 6,
                  padding: "3px 6px",
                  background: "rgba(255,255,255,0.6)",
                  outline: "none",
                  color: "#000",
                }}
              />
              {divider}
            </>
          );
        })()}

        {/* Draw-mode options: brush type, sizes, eraser */}
        {toolMode === "draw" && (
          <>
            <button
              onClick={() => setBrushType("round")}
              style={brushType === "round" && !isEraser ? btnActiveStyle : btnStyle}
            >
              Round
            </button>
            <button
              onClick={() => setBrushType("pixel")}
              style={brushType === "pixel" && !isEraser ? btnActiveStyle : btnStyle}
            >
              Pixel
            </button>

            {divider}

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="range"
                min={2}
                max={40}
                step={1}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                style={{ width: 80, cursor: "pointer" }}
              />
              <div style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{
                  width: Math.max(4, brushSize),
                  height: Math.max(4, brushSize),
                  borderRadius: brushType === "pixel" ? 0 : "50%",
                  background: isEraser ? "transparent" : "#000",
                  border: isEraser ? "2px solid #000" : "none",
                  boxSizing: "border-box",
                }} />
              </div>
            </div>

            {divider}

            <button
              onClick={() => setIsEraser((v) => !v)}
              style={isEraser ? btnActiveStyle : btnStyle}
            >
              Eraser
            </button>
          </>
        )}

        {/* Sticker-mode options */}
        {toolMode === "sticker" && (
          <>
            <select
              value={stickerShape}
              onChange={(e) => setStickerShape(e.target.value as StickerShape)}
              style={{
                fontSize: 13,
                fontFamily: "inherit",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 8,
                padding: "5px 8px",
                background: "rgba(0,0,0,0.06)",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {STICKER_SHAPES.map(({ shape, label }) => (
                <option key={shape} value={shape}>{label}</option>
              ))}
            </select>

            {divider}

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="range"
                min={40}
                max={280}
                step={1}
                value={stickerSize}
                onChange={(e) => setStickerSize(Number(e.target.value))}
                style={{ width: 80, cursor: "pointer" }}
              />
            </div>

            {divider}

            <button
              onClick={addSticker}
              style={{
                ...btnStyle,
                background: stickerColor,
                color: (() => {
                  const r = parseInt(stickerColor.slice(1, 3), 16);
                  const g = parseInt(stickerColor.slice(3, 5), 16);
                  const b = parseInt(stickerColor.slice(5, 7), 16);
                  return (r * 299 + g * 587 + b * 114) / 1000 < 128 ? "#fff" : "#000";
                })(),
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              Add +
            </button>
          </>
        )}

        {/* Image-mode options: upload + threshold */}
        {toolMode === "image" && (
          <>
            <button onClick={() => fileInputRef.current?.click()} style={btnStyle}>
              Upload Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files) handleImageUpload(e.target.files);
                e.target.value = "";
              }}
            />
            {/* {imageItems.length > 0 && (
              <>
                {divider}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", whiteSpace: "nowrap" }}>
                    Wrap
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={shapeImageThreshold}
                    onChange={(e) => setShapeImageThreshold(parseFloat(e.target.value))}
                    style={{ width: 72, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", minWidth: 28, textAlign: "right" }}>
                    {shapeImageThreshold.toFixed(2)}
                  </span>
                </div>
              </>
            )} */}
          </>
        )}

        {divider}

        <button
          onClick={() => {
            setEditorDraft(customText);
            setShowTextEditor((v) => !v);
          }}
          style={showTextEditor ? btnActiveStyle : btnStyle}
        >
          Text
        </button>

        {divider}

        <button
          onClick={clearCanvas}
          style={{ ...btnStyle, whiteSpace: "nowrap" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
        >
          Clear Paint
        </button>
        <button
          onClick={clearAll}
          style={{ ...btnStyle, whiteSpace: "nowrap" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
        >
          Clear All
        </button>
      </div>

      {/* Text editor panel */}
      {showTextEditor && (
        <div
          style={{
            position: "fixed",
            bottom: 88,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            background: "rgba(240, 240, 240, 0.95)",
            backdropFilter: "blur(12px)",
            borderRadius: 14,
            padding: 16,
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: "min(420px, calc(100vw - 32px))",
          }}
        >
          <textarea
            value={editorDraft}
            onChange={(e) => setEditorDraft(e.target.value)}
            rows={6}
            style={{
              width: "100%",
              resize: "vertical",
              border: "1px solid rgba(0,0,0,0.15)",
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: 13,
              fontFamily: "inherit",
              background: "rgba(255,255,255,0.8)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => setShowTextEditor(false)} style={btnStyle}>
              Cancel
            </button>
            <button
              onClick={() => {
                if (editorDraft.trim()) setCustomText(editorDraft);
                setShowTextEditor(false);
              }}
              style={{ ...btnStyle, background: "rgba(0,0,0,0.12)", fontWeight: 600 }}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Hint */}
      {(stickers.length > 0 && toolMode === "sticker") || (imageItems.length > 0 && toolMode === "image") ? (
        <div
          ref={hintRef}
          style={{
            position: "fixed",
            bottom: 90,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            fontSize: 12,
            color: "rgba(0,0,0,0.35)",
            pointerEvents: "none",
          }}
        >
          Drag to move. Double-click to remove.
        </div>
      ) : null}
    </main>
  );
}
