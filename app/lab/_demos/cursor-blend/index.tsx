import { Gothic_A1 } from "next/font/google";
const gothic_a1 = Gothic_A1({ subsets: ["latin"], weight: ["900"] });
import CursorBlend from "./components/CursorBlend";

export default function page() {
  return (
    <div className={`${gothic_a1.className}`}>
      <CursorBlend />
    </div>
  );
}
