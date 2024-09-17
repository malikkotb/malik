"use client";
import projects from "../../app/data";
import Card from "./Card/Card";
export default function Projects() {
  return (
    <div className="overflow-hidden">
      {/* <div className="borderr" style={{zIndex: "1000"}}>HELLO</div> */}
      {/* <Card key={`p_${0}`} {...projects[0]} i={0} /> */}
      {projects.map((project, i) => {
        return <Card key={`p_${i}`} {...project} i={i} />;
      })}
    </div>
  );
}
