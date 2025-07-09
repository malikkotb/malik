import { gsap } from "gsap";
import { useEffect } from "react";

import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger, SplitText);
export default function ScrambleLink({ href, children, target }) {
  useEffect(() => {
    const initScrambleOnHover = () => {
      const targets = document.querySelectorAll(
        '[data-scramble-hover="link"]'
      );
      targets.forEach((target) => {
        let textEl = target.querySelector(
          '[data-scramble-hover="target"]'
        );
        let originalText = textEl.textContent;
        // if this attribute is present, take a custom hover text
        let customHoverText = textEl.getAttribute(
          "data-scramble-text"
        );

        new SplitText(textEl, {
          type: "words, chars",
          wordsClass: "word",
          charsClass: "char",
        });

        target.addEventListener("mouseenter", () => {
          gsap.to(textEl, {
            duration: 1,
            scrambleText: {
              text: customHoverText || originalText,
              chars: "◊▯∆|",
            },
          });
        });

        // target.addEventListener("mouseleave", () => {
        //   gsap.to(textEl, {
        //     duration: 0.6,
        //     scrambleText: {
        //       text: originalText,
        //       speed: 2,
        //       chars: "◊▯∆",
        //     },
        //   });
        // });
      });
    };

    initScrambleOnHover();
  }, []);

  return (
    <a
      href={href}
      {...(target && { target: "_blank" })}
      data-scramble-hover='link'
      className='w-fit opacity-65 transition-opacity duration-300 ease-in-out hover:opacity-100'
    >
      <p
        data-scramble-hover='target'
        // data-scramble-text='this text can be custom too'
        data-scramble-text={children}
      >
        {children}
      </p>
    </a>
  );
}
