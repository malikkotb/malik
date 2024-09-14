"use client";
import projects from "../../app/projects";
import Card from "./Card/Card";
export default function Projects() {
  return (
    <div className="mt-[50vh] mb-[50vh]">
      {projects.map((project, i) => {
        return <Card key={`p_${i}`} {...project} i={i} />;
      })}
    </div>
  );
}
