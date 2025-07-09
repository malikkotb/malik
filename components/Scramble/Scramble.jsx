import { gsap } from "gsap";
import { useEffect } from "react";

import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger, SplitText);

export default function Scramble() {
  useEffect(() => {
    // LOAD
    const initScrambleOnLoad = () => {
      const targets = document.querySelectorAll(
        '[data-scramble="load"]'
      );
      targets.forEach((target) => {
        const split = new SplitText(target, {
          type: "words, chars",
          wordsClass: "word",
          charsClass: "char",
        });

        gsap.to(split.words, {
          duration: 1.2,
          stagger: 0.01,
          scrambleText: {
            text: "{original}",
            chars: "upperCase",
            speed: 0.85,
          },
          // Once animation is done, revert the split to reduce DOM size
          onComplete: () => split.revert(),
        });
      });
    };

    // SCROLL
    const initScrambleOnScroll = () => {
      const targets = document.querySelectorAll(
        '[data-scramble="scroll"]'
      );
      targets.forEach((target) => {
        const isAlternative = target.hasAttribute(
          "data-scramble-alt"
        );
        const split = new SplitText(target, {
          type: "words, chars",
          wordsClass: "word",
          charsClass: "char",
        });

        gsap.to(split.words, {
          duration: 1.4,
          stagger: 0.015,
          scrambleText: {
            text: "{original}",
            chars: isAlternative ? "▯|" : "upperCase", // experiment with different scramble characters here
            speed: 0.95,
          },
          scrollTrigger: {
            trigger: target,
            start: "top bottom",
            once: true,
          },
          // Once animation is done, revert the split to reduce DOM size
          onComplete: () => split.revert(),
        });
      });
    };

    // HOVER
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

        target.addEventListener("mouseleave", () => {
          gsap.to(textEl, {
            duration: 0.6,
            scrambleText: {
              text: originalText,
              speed: 2,
              chars: "◊▯∆",
            },
          });
        });
      });
    };

    // Init all
    initScrambleOnLoad();
    initScrambleOnScroll();
    initScrambleOnHover();
  }, []);

  return (
    <div className='demo-group'>
      <div className='scramble-section'>
        <h1 data-scramble='load' className='scramble-heading'>
          This heading will reveal with a basic scrambling effect
          <br />
          on page load
        </h1>
      </div>

      <div className='scramble-section u--bg-light'>
        <h2 data-scramble='scroll' className='scramble-heading'>
          this is an example of a heading that is triggered by a
          scrolltrigger
        </h2>
      </div>

      <div className='scramble-section'>
        <h2
          data-scramble='scroll'
          data-scramble-alt=''
          className='scramble-heading'
        >
          You can even control the characters that are used during
          scramble
        </h2>
      </div>

      <div className='scramble-section u--bg-light'>
        <h2 className='scramble-heading'>
          and here&apos;s how to work with scramble text on hover:
        </h2>
        <a
          href='#'
          data-scramble-hover='link'
          className='scramble-button w-inline-block'
        >
          <p
            className='scramble-button-text'
            data-scramble-hover='target'
            data-scramble-text='this text can be custom too'
          >
            How to scramble on hover
          </p>
        </a>
      </div>
    </div>
  );
}
