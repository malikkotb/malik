"use client";
import { useState, useMemo } from "react";
import { InfiniteScroll } from "@/components/Infinite-Scroll/infinite-scroll";

// 10 rows × 6 columns matrix
// Edit this matrix directly to set initial values (0 = no image, 1 = image)
const initialMatrix = [
  [0, 1, 0, 0, 1, 1],
  [1, 0, 1, 0, 1, 0],
  [1, 0, 0, 1, 0, 1],
  [0, 1, 1, 0, 1, 0],
];

// TODO: get random layout every time the page is loaded of the matrix but make sure its evenly spread out
// TODO: add a button to shuffle the matrix

export default function LabClient({ labPosts }) {
  // Initialize matrix from the constant
  const [matrix, setMatrix] = useState(() => {
    // Deep copy the initial matrix
    return initialMatrix.map((row) => [...row]);
  });

  return (
    <div className='w-full h-full mt-[28px]'>
      <InfiniteScroll style={{ height: "calc(100vh - 56px)" }}>
        <div className='space-y-[80px] pb-[80px] lg:space-y-[64px]'>
          {matrix.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className='grid grid-cols-6 gap-[7px]'
            >
              {row.map((cell, colIndex) => {
                // Calculate transform origin based on position
                const isLeftEdge = colIndex === 0;
                const isRightEdge = colIndex === row.length - 1;
                const transformOrigin = isLeftEdge
                  ? "left center"
                  : isRightEdge
                    ? "right center"
                    : "center center";

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => {
                      // TODO: use correct link to the experiment
                      if (cell === 1) {
                        window.open(
                          "https://maliks-playground.vercel.app/",
                          "_blank"
                        );
                      }
                    }}
                    className={`overflow-hidden ${cell === 1 ? "cursor-pointer" : "cursor-default"}`}
                    style={{
                      aspectRatio: "4/3",
                      transformOrigin,
                    }}
                  >
                    {/* {cell === 1 ? (
                      <video
                        src='/video1.mov'
                        autoPlay
                        loop
                        muted
                        playsInline
                        className='w-full h-full object-cover'
                      />
                    ) : null} */}
                    {cell === 1 ? (
                      <img src='/image.png' alt='lab' className='w-full h-full object-cover' />
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
