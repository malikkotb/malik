"use client";

import { InfiniteScroll } from "@/components/Infinite-Scroll/infinite-scroll";

export default function CaseStudy() {
  // Generate some colored cards
  const colors = [
    "#FF6B6B", // red
    "#4ECDC4", // teal
    "#45B7D1", // blue
    "#FFA07A", // salmon
    "#98D8C8", // mint
    "#F7DC6F", // yellow
    "#BB8FCE", // purple
    "#85C1E2", // sky blue
    "#F8B88B", // peach
    "#AAB7B8", // gray
    "#52C17C", // green
    "#E67E22", // orange
  ];

  return (
    <div className="h-screen overflow-hidden w-full p-12">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* First 5 columns - Info section */}
        <div className="col-span-5 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl">Case Study</h1>
          </div>
          <div>
            <h2 className="text-2xl">Links</h2>
          </div>
        </div>

        {/* Last 7 columns - Infinite scroll cards */}
        <div className="col-span-7 overflow-hidden">
          <InfiniteScroll style={{ height: "100%" }}>
            <div className="flex flex-col gap-4">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{
                    width: "400px",
                    height: "400px",
                    backgroundColor: color,
                  }}
                />
              ))}
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
}
