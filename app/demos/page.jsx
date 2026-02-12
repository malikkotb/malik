"use client";
import Link from "next/link";
import { InfiniteScroll } from "@/components/Infinite-Scroll/infinite-scroll";
import { frameworks } from "@/components/demos/ui/ComboBox";

const COLUMNS = 4;

// Define the matrix pattern (0 = empty, 1 = demo)
// This creates a visually interesting layout with empty spaces
const matrixPattern = [
  [0, 1, 0, 1],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 0, 1],
  [0, 1, 1, 0],
  [1, 0, 1, 0],
  [1, 1, 0, 1],
  [0, 1, 0, 0],
];

export default function DemosPage() {
  // Build rows by following the matrix pattern
  let demoIndex = 0;
  const rows = matrixPattern.map((pattern) => {
    return pattern.map((hasDemo) => {
      if (hasDemo === 1 && demoIndex < frameworks.length) {
        return frameworks[demoIndex++];
      }
      return null; // Empty cell
    });
  });

  const showComingSoon = false;

  if (showComingSoon) {
    return (
      <main className="w-full h-[90vh] mt-[28px] flex items-center justify-center">
        <div className="text-center text-[12px]">Updated Lab Coming Soon</div>
      </main>
    );
  }

  return (
    <main className="w-full h-full mt-[28px]">
      <InfiniteScroll style={{ height: "calc(100vh - 56px)" }}>
        <div className="space-y-[80px] pb-[80px] lg:space-y-[64px]">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-[7px]">
              {row.map((demo, colIndex) => {
                const isLeftEdge = colIndex === 0;
                const isRightEdge = colIndex === COLUMNS - 1;
                const transformOrigin = isLeftEdge
                  ? "left center"
                  : isRightEdge
                    ? "right center"
                    : "center center";

                if (demo === null) {
                  // Empty cell
                  return (
                    <div
                      key={`empty-${rowIndex}-${colIndex}`}
                      className="cursor-default"
                      style={{
                        aspectRatio: "4/3",
                        transformOrigin,
                      }}
                    />
                  );
                }

                return (
                  <Link
                    key={demo.value}
                    href={`/demos/${demo.value}`}
                    className="relative group block overflow-hidden cursor-pointer"
                    style={{
                      aspectRatio: "4/3",
                      transformOrigin,
                    }}
                  >
                    <div className="w-full h-full">
                      <img
                        src="/image.png"
                        alt={demo.label}
                        className="w-full h-full p-[20%] object-cover"
                      />
                    </div>
                    {/* Centered red text with shadow */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="text-red-500 text-lg font-bold"
                        style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
                      >
                        {demo.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </main>
  );
}
