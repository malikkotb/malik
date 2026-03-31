"use client";
import HoverList from "../HoverList/HoverList";
import projects from "@/app/data";
import { useState } from "react";
import ProjectCard from "../ProjectCard/ProjectCard";

export default function Work({ isHomePage = false }) {
  const [view, setView] = useState(isHomePage ? "list" : "grid");

  return (
    <div id='work' className={`${isHomePage ? '' : 'min-h-[60vh]'} h-full w-full`}>
      <div className={`flex justify-between ${isHomePage ? '' : 'pb-4'}`}>
        <div className='eyebrow eyebrow-light'>Selected Works</div>
        {!isHomePage && (
          <div className='flex gap-1.5'>
            <button
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              className={`header-btn ${view === "grid" ? "opacity-100" : "opacity-60"}`}
            >
              Grid
            </button>
            <button
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={`header-btn ${view === "list" ? "opacity-100" : "opacity-60"}`}
            >
              List
            </button>
          </div>
        )}
      </div>

      {isHomePage ? (
        <HoverList projects={projects} isHomePage={isHomePage} />
      ) : (
        <>
          <div className={view !== "list" ? "hidden" : ""}>
            <HoverList projects={projects} isHomePage={isHomePage} />
          </div>
          <div
            id='projects'
            className={`relative w-full grid gap-[12px] gap-y-8 grid-cols-1 lg:grid-cols-2 pb-8 lg:pb-0 ${view !== "grid" ? "hidden" : ""}`}
          >
            {projects.map((project, i) => (
              <ProjectCard
                key={i}
                title={project.projectTitle}
                videoSrc={project.videoSrc}
                link={project.link}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
