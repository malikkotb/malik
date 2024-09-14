"use client";
import projects from "../../app/projects";
import Card from "./Card";
export default function Projects() {
  return (
    <div
      style={{
        border: "1px solid blue",
      }}
      className="h-screen mt-[50vh] mb-[50vh]"
    >{projects.map((project, i) => {
        return <Card key={`p_${i}`} {...project} i={i} />
    })}</div>
  );
}
