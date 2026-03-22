"use client";
import Services from "./Services/Services";

export default function InfoOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-start backdrop-blur-md bg-white/10 p-4">
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
      <div className="flex flex-col mt-8 md:[&_.hero-heading]:!text-[1.75rem] [&_.hero-heading]:!text-black/50">
        <Services />
      </div>
    </div>
  );
}
