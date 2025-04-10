import { useState } from "react";
import MagneticButton from "./MagneticButton";
import Zoop from "./Zoop";
const ScrollToTopButton = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={handleScrollToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className='text-xl font-neuemontreal-bold text-white rounded-full'
    >
      <Zoop isHovered={isHovered}>↑</Zoop>
    </button>
  );
};

export default ScrollToTopButton;
