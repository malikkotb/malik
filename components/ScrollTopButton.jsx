import MagneticButton from "./MagneticButton";
const ScrollToTopButton = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MagneticButton>
      <button
        onClick={handleScrollToTop}
        style={{ color: "rgb(18, 18, 18)" }}
        className="p-3 px-4 bg-white rounded-full shadow-lg "
      >
        ↑
      </button>
    </MagneticButton>
  );
};

export default ScrollToTopButton;
