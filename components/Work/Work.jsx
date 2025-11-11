import HoverList from "../HoverList/HoverList";
import projects from "@/app/data";
import { useState } from "react";
import ProjectCard from "../ProjectCard/ProjectCard";
export default function Work() {
  const [view, setView] = useState("grid");
  return (
    <div id='work' className='min-h-[75vh] h-full w-full'>
      <div className='flex justify-between'>
        <div className='eyebrow eyebrow-light'>Selected Works</div>
        <div className='flex gap-2 eyebrow'>
          <div
            onClick={() => setView("grid")}
            style={{ color: "black" }}
            className={`cursor-pointer text-black ${
              view === "grid" ? "opacity-100" : "opacity-60"
            }`}
          >
            Grid
          </div>
          <div
            onClick={() => setView("list")}
            className={`cursor-pointer text-black ${
              view === "list" ? "opacity-100" : "opacity-60"
            }`}
          >
            List
          </div>
        </div>
      </div>
      {view === "list" ? (
        <HoverList projects={projects} />
      ) : (
        <div
          id='projects'
          className='relative w-full grid gap-4 gap-y-8 grid-cols-1 lg:grid-cols-2'
        >
          {projects.slice(0, 4).map((project, i) => {
            return (
              <ProjectCard
                key={i}
                title={project.projectTitle}
                videoSrc={project.videoSrc}
                link={project.link}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
