const ScrollToTopButton = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //   TODO: make the button magnetic and come up from bottom like the zoop links

  return (
    <button
      onClick={handleScrollToTop}
      className="p-3 px-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
    >
      ↑
    </button>
  );
};

export default ScrollToTopButton;
