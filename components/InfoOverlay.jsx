"use client";
import { useEffect, useRef } from "react";
import Services from "./Services/Services";

export default function InfoOverlay({ onClose }) {
  const overlayRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Move focus into overlay on mount, restore on unmount
  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const focusable = overlayRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable?.length) focusable[0].focus();
    return () => { previousFocusRef.current?.focus(); };
  }, []);

  // Escape key + focus trap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;

      const focusable = Array.from(
        overlayRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => !el.disabled);

      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Info"
      className="fixed inset-0 z-[200] flex items-start justify-start backdrop-blur-md bg-white/30 border border-white/20 p-4 info-overlay-enter"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="header-btn absolute top-4 right-4"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div
        className="flex flex-col mt-8 [&_.hero-heading]:!text-[1rem] md:[&_.hero-heading]:!text-[1.5rem] [&_.hero-heading]:!text-black/70"
        onClick={(e) => e.stopPropagation()}
      >
        <Services />
      </div>
    </div>
  );
}
