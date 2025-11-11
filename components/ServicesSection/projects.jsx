"use client";
import Card from "./Card/Card";
export default function Projects({ projects }) {
  return (
    <div id='projects' className=''>
      {projects.map((project, i) => {
        return <Card key={`p_${i}`} {...project} i={i} />;
      })}
    </div>
  );
}
