import { useState } from "react";
import MagneticButton from "./MagneticButton";
import Zoop from "./Zoop";
const ScrollToTopButton = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <MagneticButton>
      <button
        onClick={handleScrollToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ color: "black" }}
        className="p-3 px-4 bg-white rounded-full shadow-lg"
      >
        <Zoop isHovered={isHovered}>↑</Zoop>
      </button>
    </MagneticButton>
  );
};

export default ScrollToTopButton;
