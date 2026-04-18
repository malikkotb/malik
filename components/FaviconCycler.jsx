"use client";

import { useEffect } from "react";

const colors = [
  "#b49c84",
  "#cbd0af",
  "#481f1f",
  "#d97066",
  "#cdc77f",
  "#61642b",
  "#936a2f",
  "#95ada3",
];

export default function FaviconCycler() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    let index = 0;

    function setColor(color) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 32, 32);
      link.href = canvas.toDataURL("image/png");
    }

    setColor(colors[index]);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const interval = setInterval(() => {
      index = (index + 1) % colors.length;
      setColor(colors[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
