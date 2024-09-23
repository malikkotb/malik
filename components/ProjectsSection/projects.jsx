"use client";
import projects from "../../app/data";
import Card from "./Card/Card";
export default function Projects() {
  const bgColor = "bg-black";

  return (
    <div id="projects" className="">
      {projects.map((project, i) => {
        return (
          // <div key={`p_${i}`} className={bgColor}>
          <Card key={`p_${i}`} {...project} className={bgColor} i={i} />
          // </div>
        );
      })}
    </div>
  );
}
