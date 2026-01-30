"use client";
import { InfiniteGridWebGL } from "@/components/InfiniteGridWebGL/InfiniteGridWebGL";

export default function DemosNewPage() {
  const items = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    texture: '/image.png',
    color: `hsl(${i * 36}, 70%, 50%)`,
  }));

  return (
    <main className="w-full h-screen">
      <InfiniteGridWebGL items={items} />
    </main>
  );
}
