import { useEffect } from "react";
import "./banner.css";
export default function Banner() {
  // Note: The Javascript is optional. Read the documentation below how to use the CSS Only version.

  function initCSSMarquee() {
    const pixelsPerSecond = 75; // Set the marquee speed (pixels per second)
    const marquees = document.querySelectorAll("[data-css-marquee]");

    // Duplicate each [data-css-marquee-list] element inside its container
    marquees.forEach((marquee) => {
      marquee
        .querySelectorAll("[data-css-marquee-list]")
        .forEach((list) => {
          const duplicate = list.cloneNode(true);
          marquee.appendChild(duplicate);
        });
    });

    // Create an IntersectionObserver to check if the marquee container is in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target
            .querySelectorAll("[data-css-marquee-list]")
            .forEach(
              (list) =>
                (list.style.animationPlayState = entry.isIntersecting
                  ? "running"
                  : "paused")
            );
        });
      },
      { threshold: 0 }
    );

    // Calculate the width and set the animation duration accordingly
    marquees.forEach((marquee) => {
      marquee
        .querySelectorAll("[data-css-marquee-list]")
        .forEach((list) => {
          list.style.animationDuration =
            list.offsetWidth / pixelsPerSecond + "s";
          list.style.animationPlayState = "paused";
        });
      observer.observe(marquee);
    });
  }

  // Initialize Discover my updated portfolio and work here.
  useEffect(() => {
    initCSSMarquee();
  }, []);

  return (
    <a href="https://malikotb.com" data-css-marquee='' className='marquee-css'>
      <div data-css-marquee-list='' className='marquee-css__list'>
        <div className='marquee-css__item'>
          <p className='marquee-css__item-p'>Discover my updated portfolio and work here.</p>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='100%'
            viewBox='0 0 50 50'
            fill='none'
            className='marquee-css__item-svg'
          >
            <path
              d='M17.6777 32.3223C12.9893 27.6339 6.63041 25 0 25C6.63041 25 12.9893 22.3661 17.6777 17.6777C22.3661 12.9893 25 6.63041 25 0C25 6.63041 27.6339 12.9893 32.3223 17.6777C37.0107 22.3661 43.3696 25 50 25C43.3696 25 37.0107 27.6339 32.3223 32.3223C27.6339 37.0107 25 43.3696 25 50C25 43.3696 22.3661 37.0107 17.6777 32.3223Z'
              fill='#ff6b00'
            ></path>
          </svg>
        </div>
        <div className='marquee-css__item'>
          <p className='marquee-css__item-p'>Discover my updated portfolio and work here.</p>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='100%'
            viewBox='0 0 50 50'
            fill='none'
            className='marquee-css__item-svg'
          >
            <path
              d='M17.6777 32.3223C12.9893 27.6339 6.63041 25 0 25C6.63041 25 12.9893 22.3661 17.6777 17.6777C22.3661 12.9893 25 6.63041 25 0C25 6.63041 27.6339 12.9893 32.3223 17.6777C37.0107 22.3661 43.3696 25 50 25C43.3696 25 37.0107 27.6339 32.3223 32.3223C27.6339 37.0107 25 43.3696 25 50C25 43.3696 22.3661 37.0107 17.6777 32.3223Z'
              fill='#ff6b00'
            ></path>
          </svg>
        </div>
        <div className='marquee-css__item'>
          <p className='marquee-css__item-p'>Discover my updated portfolio and work here.</p>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='100%'
            viewBox='0 0 50 50'
            fill='none'
            className='marquee-css__item-svg'
          >
            <path
              d='M17.6777 32.3223C12.9893 27.6339 6.63041 25 0 25C6.63041 25 12.9893 22.3661 17.6777 17.6777C22.3661 12.9893 25 6.63041 25 0C25 6.63041 27.6339 12.9893 32.3223 17.6777C37.0107 22.3661 43.3696 25 50 25C43.3696 25 37.0107 27.6339 32.3223 32.3223C27.6339 37.0107 25 43.3696 25 50C25 43.3696 22.3661 37.0107 17.6777 32.3223Z'
              fill='#ff6b00'
            ></path>
          </svg>
        </div>
        <div className='marquee-css__item'>
          <p className='marquee-css__item-p'>Discover my updated portfolio and work here.</p>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='100%'
            viewBox='0 0 50 50'
            fill='none'
            className='marquee-css__item-svg'
          >
            <path
              d='M17.6777 32.3223C12.9893 27.6339 6.63041 25 0 25C6.63041 25 12.9893 22.3661 17.6777 17.6777C22.3661 12.9893 25 6.63041 25 0C25 6.63041 27.6339 12.9893 32.3223 17.6777C37.0107 22.3661 43.3696 25 50 25C43.3696 25 37.0107 27.6339 32.3223 32.3223C27.6339 37.0107 25 43.3696 25 50C25 43.3696 22.3661 37.0107 17.6777 32.3223Z'
              fill='#ff6b00'
            ></path>
          </svg>
        </div>
      </div>
    </a>
  );
}
