"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import projects from "@/app/data";
import CardHoverSection from "./CardHoverSection";
export default function HoverProjectSection() {
  return (
    <div className="borderr relative w-full bg-black text-white h-[100vh]">
      <div className="mx-4">
        <div className="uppercase items-center border-white py-4 text-zinc-400 text-xs w-full grid grid-cols-2 md:grid-cols-4">
          <span>Project</span>
          <span className="hidden md:block">Category</span>
          <span className="hidden md:block text-left ml-12">Client</span>
          <span className="md:text-right">Year</span>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {projects.map((project, i) => {
            return (
              <AccordionItem key={i} value={`item-${i + 1}`}>
                <AccordionTrigger className="relative">
                  <div className="group text-sm items-center absolute transition-colors duration-300 ease-in-out hover:bg-white hover:text-black h-full font-medium w-full grid grid-cols-2 md:grid-cols-4">
                    <span className="text-nowrap text-xl text-left transform transition-transform duration-300 ease-in-out md:group-hover:translate-x-2">
                      {project.projectTitle}
                    </span>
                    <span className="hidden md:block text-nowrap text-left">
                      {project.category}
                    </span>
                    <span className="hidden md:block text-nowrap text-left ml-12">
                      {project.client}
                    </span>
                    <span className="md:text-right text-nowrap transform transition-transform duration-300 ease-in-out md:group-hover:-translate-x-2">
                      {project.year}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardHoverSection {...project} className={"bg-black"} i={i} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
