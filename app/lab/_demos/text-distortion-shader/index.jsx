"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { InfiniteScroll } from "@/components/Infinite-Scroll/infinite-scroll";
// import GUI from "lil-gui";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

const IMAGES = [
  "/parallax-scroll/1.avif",
  "/tete-substack/tete-substack1.jpeg",
  "/tete-substack/tete-substack2.jpeg",
  "/tete-substack/tete-substack3.jpeg",
  "/tete-substack/tete-substack4.jpeg",
  "/tete-substack/tete-substack5.jpeg",
  "/tete-substack/tete-substack6.jpg",
];

const IMAGE_TITLES = [
  "Alfresco Picknick",
  "Alfresco Picknick",
  "Oil Garnish Desert",
  "Creative Cocktails",
  "Year of the Horse",
  "Bread & Butter",
  "Whipped Brown Butter",
];

async function createTextCanvasTexture(text, width, height, textColor, bgColor) {
  const font = new FontFace(
    "NeueHaasGrot",
    "url(/demos/fonts/NeueHaasGrotText-65Medium-Trial.otf)"
  );
  await font.load();
  document.fonts.add(font);

  const dpr = Math.min(window.devicePixelRatio, 2);
  const canvas = document.createElement("canvas");
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  let fontSize = Math.min(width * 0.12, 200);
  ctx.font = `${fontSize}px NeueHaasGrot, sans-serif`;
  ctx.letterSpacing = `${fontSize * -0.02}px`;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let metrics = ctx.measureText(text);
  while (metrics.width > width * 0.85 && fontSize > 20) {
    fontSize -= 2;
    ctx.font = `${fontSize}px NeueHaasGrot, sans-serif`;
    ctx.letterSpacing = `${fontSize * -0.02}px`;
    metrics = ctx.measureText(text);
  }

  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.premultiplyAlpha = false;
  texture.needsUpdate = true;
  return texture;
}

export default function TextDistortionShader() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null); // holds { updateTexture, updateBg, sizes }
  const activeIndexRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState(IMAGE_TITLES[0]);
  const [textColor, setTextColor] = useState("#939393");
  const [bgColor, setBgColor] = useState("#ffffff");

  // draft state inside the panel (only applied on Apply)
  const [draftText, setDraftText] = useState(text);
  const [draftTextColor, setDraftTextColor] = useState("#939393");
  const [draftBgColor, setDraftBgColor] = useState("#ffffff");

  const handleOpen = () => {
    setDraftText(text);
    setDraftTextColor(textColor);
    setDraftBgColor(bgColor);
    setOpen(true);
  };

  const handleApply = () => {
    setText(draftText);
    setTextColor(draftTextColor);
    setBgColor(draftBgColor);
    setOpen(false);
  };

  // Init Three.js once
  useEffect(() => {
    if (!containerRef.current) return;
    let cleanup;
    (async () => { cleanup = await init(); })();
    return () => cleanup?.();
  }, []);

  // Re-render texture when text/colors change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.updateTexture(text, textColor, bgColor);
    scene.updateBg(bgColor);
  }, [text, textColor, bgColor]);

  const handleScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop;
    const itemHeight = window.innerHeight * 0.80;
    const totalHeight = IMAGES.length * itemHeight;
    const centerY = scrollTop + window.innerHeight * 0.5;
    const posInCycle = ((centerY % totalHeight) + totalHeight) % totalHeight;
    const shifted = ((posInCycle - itemHeight * 0.08) + totalHeight) % totalHeight;
    const index = Math.floor(shifted / itemHeight);
    if (index !== activeIndexRef.current) {
      activeIndexRef.current = index;
      setText(IMAGE_TITLES[index]);
    }
  };

  async function init() {
    if (!containerRef.current) return;

    const sizes = { width: window.innerWidth, height: window.innerHeight };
    const settings = { strength: 0.075, relaxation: 0.97, brushRadius: 0.045 };

    const gridSize = 128;
    const dataArray = new Float32Array(gridSize * gridSize * 4);
    let dataTexture = new THREE.DataTexture(dataArray, gridSize, gridSize, THREE.RGBAFormat, THREE.FloatType);
    dataTexture.magFilter = THREE.LinearFilter;
    dataTexture.minFilter = THREE.LinearFilter;
    dataTexture.needsUpdate = true;

    const scene = new THREE.Scene();
    const frustumSize = sizes.height;
    const aspect = sizes.width / sizes.height;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2, (frustumSize * aspect) / 2,
      frustumSize / 2, frustumSize / -2, -1000, 1000
    );
    camera.position.set(0, 0, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);

    // read initial values from state refs so init captures them
    let currentText = IMAGE_TITLES[0];
    let currentTextColor = "#939393";
    let currentBgColor = "#ffffff";

    let textTexture = await createTextCanvasTexture(currentText, sizes.width, sizes.height, currentTextColor, currentBgColor);

    const textMaterial = new THREE.ShaderMaterial({
      vertexShader, fragmentShader,
      uniforms: {
        uTexture: { value: textTexture },
        uDataTexture: { value: dataTexture },
        uResolution: { value: new THREE.Vector2(sizes.width, sizes.height) },
        uStrength: { value: settings.strength },
      },
    });

    const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(sizes.width, sizes.height), textMaterial);
    scene.add(textPlane);

    // Expose update functions via ref
    sceneRef.current = {
      updateTexture: (newText, newTextColor, newBgColor) => {
        currentText = newText;
        currentTextColor = newTextColor;
        currentBgColor = newBgColor;
        createTextCanvasTexture(newText, sizes.width, sizes.height, newTextColor, newBgColor).then((t) => {
          textTexture.dispose();
          textTexture = t;
          textMaterial.uniforms.uTexture.value = t;
        });
      },
      updateBg: (color) => {
        const hex = parseInt(color.replace("#", ""), 16);
        renderer.setClearColor(hex, 1);
      },
    };

    // Mouse tracking
    const mouse = { x: 0, y: 0 };
    const prevMouse = { x: 0, y: 0 };
    let mouseInitialized = false;

    const handleMouseMove = (e) => {
      if (!mouseInitialized) { prevMouse.x = e.clientX / sizes.width; prevMouse.y = e.clientY / sizes.height; mouseInitialized = true; }
      mouse.x = e.clientX / sizes.width;
      mouse.y = e.clientY / sizes.height;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        const tx = e.touches[0].clientX / sizes.width;
        const ty = e.touches[0].clientY / sizes.height;
        if (!mouseInitialized) { prevMouse.x = tx; prevMouse.y = ty; mouseInitialized = true; }
        mouse.x = tx; mouse.y = ty;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    // // GUI
    // const gui = new GUI({ width: 300, title: "Text Distortion" });
    // gui.domElement.style.position = "absolute";
    // gui.domElement.style.bottom = "0";
    // gui.domElement.style.left = "0";
    // gui.domElement.style.top = "auto";
    // gui.domElement.style.right = "auto";
    // gui.add(settings, "strength", 0.01, 0.2, 0.005).name("Strength");
    // gui.add(settings, "relaxation", 0.92, 0.995, 0.001).name("Relaxation");
    // gui.add(settings, "brushRadius", 0.02, 0.1, 0.005).name("Brush Radius");

    // Animation loop
    const animate = () => {
      const vx = mouse.x - prevMouse.x;
      const vy = mouse.y - prevMouse.y;
      prevMouse.x = mouse.x;
      prevMouse.y = mouse.y;

      const brushRadius = settings.brushRadius;
      const relaxation = settings.relaxation;

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const idx = (i * gridSize + j) * 4;
          const cellX = (j + 0.5) / gridSize;
          const cellY = (i + 0.5) / gridSize;
          const dx = cellX - mouse.x;
          const dy = cellY - (1.0 - mouse.y);
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < brushRadius) {
            const influence = 1.0 - dist / brushRadius;
            const smooth = influence * influence * (3.0 - 2.0 * influence);
            dataArray[idx] += vx * smooth * 20;
            dataArray[idx + 1] += -vy * smooth * 20;
          }

          dataArray[idx] *= relaxation;
          dataArray[idx + 1] *= relaxation;
          dataArray[idx] = Math.max(-1, Math.min(1, dataArray[idx]));
          dataArray[idx + 1] = Math.max(-1, Math.min(1, dataArray[idx + 1]));
        }
      }

      dataTexture.needsUpdate = true;
      textMaterial.uniforms.uStrength.value = settings.strength;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Resize
    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      const newAspect = sizes.width / sizes.height;
      const newFrustum = sizes.height;
      camera.left = (newFrustum * newAspect) / -2;
      camera.right = (newFrustum * newAspect) / 2;
      camera.top = newFrustum / 2;
      camera.bottom = newFrustum / -2;
      camera.updateProjectionMatrix();

      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      textTexture.dispose();
      createTextCanvasTexture(currentText, sizes.width, sizes.height, currentTextColor, currentBgColor).then((t) => {
        textTexture = t;
        textMaterial.uniforms.uTexture.value = t;
      });
      textMaterial.uniforms.uResolution.value.set(sizes.width, sizes.height);

      textPlane.geometry.dispose();
      textPlane.geometry = new THREE.PlaneGeometry(sizes.width, sizes.height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      sceneRef.current = null;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      // gui.destroy();
      textPlane.geometry.dispose();
      textMaterial.dispose();
      textTexture.dispose();
      dataTexture.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Infinite scroll image overlay */}
      <InfiniteScroll
        className="absolute inset-0"
        style={{ height: "100%" }}
        onScroll={handleScroll}
      >
        {IMAGES.map((src, i) => (
          <div key={src} className="w-full flex items-center justify-center" style={{ height: "80vh", padding: "8vh 0" }}>
            <img
              src={src}
              alt=""
              className="object-cover"
              style={{ maxHeight: "100%", maxWidth: "100%", width: "auto", height: "auto", opacity: i === 0 ? 0 : 1 }}
            />
          </div>
        ))}
      </InfiniteScroll>

      {/* Plus button */}
      {/* {!open && (
        <button
          onClick={handleOpen}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-black/10 backdrop-blur-md border border-black/20 text-black text-2xl flex items-center justify-center hover:bg-black/20 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
          style={{ lineHeight: 1 }}
        >
          +
        </button>
      )} */}

      {/* Expanded panel */}
      {/* {open && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/5 backdrop-blur-md border border-black/15 rounded-xl p-6 flex flex-col gap-4 w-80 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-1">
            <label className="text-black/50 text-xs uppercase tracking-widest">Text</label>
            <input
              type="text"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              className="bg-black/5 border border-black/15 rounded-xl px-3 py-2 text-black text-sm outline-none focus:border-black/40 transition-colors placeholder-black/30"
            />
          </div>
          <div className="flex gap-3 h-14">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-black/50 text-xs uppercase tracking-widest shrink-0">Text Color</label>
              <input
                type="color"
                value={draftTextColor}
                onChange={(e) => setDraftTextColor(e.target.value)}
                className="w-full flex-1 min-h-0 rounded-xl cursor-pointer p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[10px]"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-black/50 text-xs uppercase tracking-widest shrink-0">BG Color</label>
              <input
                type="color"
                value={draftBgColor}
                onChange={(e) => setDraftBgColor(e.target.value)}
                className="w-full flex-1 min-h-0 rounded-xl cursor-pointer p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[10px]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 py-2 rounded-xl bg-black/5 border border-black/15 text-black/60 text-sm hover:bg-black/10 hover:text-black transition-all">Cancel</button>
            <button onClick={handleApply} className="flex-1 py-2 rounded-xl bg-white/90 text-black text-sm font-medium hover:bg-white transition-all shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.4)]">Apply</button>
          </div>
        </div>
      )} */}
    </div>
  );
}
