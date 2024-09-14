"use client";
import projects from "../../app/projects";
import Card from "./Card/Card";
export default function Projects() {
  return (
    <div className="">
      {projects.map((project, i) => {
        return <Card key={`p_${i}`} {...project} i={i} />;
      })}
    </div>
  );
}
