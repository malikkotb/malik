/**
 * Sets up the sliding hover effect on all .header-btn elements
 * found within a container. Returns a cleanup function.
 *
 * Technique: a ::after pseudo-element (via data-text + CSS) acts as
 * a ghost duplicate positioned below. On hover the .btn-text span
 * slides up by the button height, bringing the ghost into view.
 *
 * Currently commented out — text slide disabled in favour of
 * scale + background hover. Uncomment to re-enable.
 */
export function applyBtnHover(container) {
  if (!container) return () => {};

  /*
  const isHoverDevice = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cleanups = [];

  container.querySelectorAll(".header-btn").forEach((btn) => {
    const text = btn.querySelector(".btn-text");
    if (!text) return;

    // Set data-text for the ::after ghost
    if (!text.getAttribute("data-text")) {
      text.setAttribute("data-text", text.textContent);
    }

    const updateVars = () => {
      const h = btn.offsetHeight;
      text.style.setProperty("--btn-h", h + "px");
    };
    updateVars();

    const onResize = () => updateVars();
    window.addEventListener("resize", onResize, { passive: true });

    if (isHoverDevice && !prefersReduced) {
      const onEnter = () => {
        updateVars();
        text.style.willChange = "transform";
        text.style.transform = `translateY(calc(-1 * var(--btn-h)))`;
      };
      const onLeave = () => {
        text.style.transform = "translateY(0)";
        const cleanup = () => {
          text.style.willChange = "";
          text.removeEventListener("transitionend", cleanup);
        };
        text.addEventListener("transitionend", cleanup);
      };
      btn.addEventListener("mouseenter", onEnter);
      btn.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        btn.removeEventListener("mouseenter", onEnter);
        btn.removeEventListener("mouseleave", onLeave);
      });
    }

    cleanups.push(() => window.removeEventListener("resize", onResize));
  });

  return () => cleanups.forEach((fn) => fn());
  */

  return () => {};
}
