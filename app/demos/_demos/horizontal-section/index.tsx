import HorizontalScroll from "./components/HorizontalScroll";
import TopSection from "./components/TopSection";
import BottomSection from "./components/BottomSection";
import SmoothScrolling from "./components/SmoothScrolling";
import { DM_Serif_Display } from "next/font/google";

const serif = DM_Serif_Display({ subsets: ["latin"], weight: ["400"] });


export default function Home() {
  return (
    <main className={`${serif.className} bg-white flex flex-col mt-[28px] mb-12 w-full`}>
      <TopSection />
      <HorizontalScroll />
      <BottomSection />
    </main>
  );
}
