"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import "./HoverListSidebar.css";

const HoverListSidebar = ({ posts, basePath }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/tap_01.wav");
    audioRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    function initDirectionalListHover() {
      const directionMap = {
        top: "translateY(-100%)",
        bottom: "translateY(100%)",
        left: "translateX(-100%)",
        right: "translateX(100%)",
      };

      document
        .querySelectorAll("[data-directional-hover-sidebar]")
        .forEach((container) => {
          const type = container.getAttribute("data-type") || "y";

          container
            .querySelectorAll("[data-directional-hover-item]")
            .forEach((item) => {
              const tile = item.querySelector(
                "[data-directional-hover-tile-sidebar]"
              );
              if (!tile) return;

              item.addEventListener("mouseenter", (e) => {
                const dir = getDirection(e, item, type);
                tile.style.transition = "none";
                tile.style.transform =
                  directionMap[dir] || "translate(0, 0)";
                void tile.offsetHeight; // force reflow
                tile.style.transition = "";
                tile.style.transform = "translate(0%, 0%)";
                item.setAttribute("data-status", `enter-${dir}`);
              });

              item.addEventListener("mouseleave", (e) => {
                const dir = getDirection(e, item, type);
                item.setAttribute("data-status", `leave-${dir}`);
                tile.style.transform =
                  directionMap[dir] || "translate(0, 0)";
              });
            });

          function getDirection(event, el, type) {
            const {
              left,
              top,
              width: w,
              height: h,
            } = el.getBoundingClientRect();
            const x = event.clientX - left;
            const y = event.clientY - top;

            if (type === "y") return y < h / 2 ? "top" : "bottom";
            if (type === "x") return x < w / 2 ? "left" : "right";

            const distances = {
              top: y,
              right: w - x,
              bottom: h - y,
              left: x,
            };

            return Object.entries(distances).reduce((a, b) =>
              a[1] < b[1] ? a : b
            )[0];
          }
        });
    }

    initDirectionalListHover();
  }, []);

  return (
    <div
      data-directional-hover-sidebar
      data-type='y'
      className='directional-list-sidebar'
    >
      <div className='directional-list__collection-sidebar'>
        <div className='directional-list__list-sidebar'>
          {posts && posts.length > 0 ? (
            posts.map((post, i) => {
              const slug = post.slug?.current || post.slug;
              const href = slug ? `${basePath}/${slug}` : "#";

              return (
                <Link
                  key={post._id || i}
                  data-directional-hover-item
                  href={href}
                  className='directional-list__item-sidebar relative'
                  onMouseEnter={() => {
                    setHoveredIndex(i);
                    // if (audioRef.current) {
                    //   audioRef.current.currentTime = 0;
                    //   audioRef.current.play().catch(() => {});
                    // }
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                  }}
                >
                  <div
                    data-directional-hover-tile-sidebar
                    className='directional-list__hover-tile-sidebar'
                  ></div>
                  <div className='directional-list__border-sidebar is--item-sidebar'></div>
                  <div className='directional-list__col-award-sidebar'>
                    <motion.p
                      className='direcitonal-list__p-sidebar pl-1'
                    //   initial={{ x: 0 }}
                    //   animate={{ x: hoveredIndex === i ? 10 : 0 }}
                    //   transition={{ ease: "linear", duration: 0.1 }}
                    >
                      {post.title}
                    </motion.p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className='text-gray-500 px-2'>No posts found</div>
          )}
        </div>
      </div>
      <div className='directional-list__border-sidebar'></div>
    </div>
  );
};

export default HoverListSidebar;

