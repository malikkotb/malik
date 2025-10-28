"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MarqueeButton from "../Marquee/MarqueeButton";
import projects from "@/app/data";
import styles from "./style.module.scss";
import ListElement from "./link";
import CardHoverSection from "./CardHoverSection";
import { useRef, useState } from "react";
import ActionCall from "../ActionCall/ActionCall";
export default function HoverProjectSection() {
  const [modal, setModal] = useState({ active: false, index: 0 });

  return (
    <div
      id="projects"
      // style={{ backgroundColor: "rgb(18, 18, 18)" }}
      className="pb-[15dvh] w-full text-white"
    >
      <div className="mx-4 relative mb-8 md:mb-0">
        <div className="uppercase items-center border-white py-4 white opacity-70 text-xs w-full grid grid-cols-2 md:grid-cols-4">
          <span>Project</span>
          <span className="hidden md:block">Category</span>
          <span className="hidden md:block text-left ml-12">Client</span>
          <span className="text-left md:text-right">Year</span>
        </div>
        <Accordion type="single" collapsible className="w-full relative">
          <MarqueeButton modal={modal} projects={projects} />
          {projects.map((project, i) => {
            return (
              <AccordionItem key={i} value={`item-${i + 1}`}>
                <div className="hidden md:block">
                  <AccordionTrigger
                    onMouseEnter={() => {
                      setModal({ active: true, i });
                    }}
                    onMouseLeave={() => {
                      setModal({ active: false, i });
                    }}
                    className="relative"
                  >
                    <div className={styles.menu}>
                      <div className={styles.body}>
                        <ListElement project={project} />
                      </div>
                    </div>
                  </AccordionTrigger>
                </div>
                <div className="block md:hidden">
                  <AccordionTrigger className="relative">
                    <div className={styles.menu}>
                      <div className={styles.body}>
                        <ListElement project={project} />
                      </div>
                    </div>
                  </AccordionTrigger>
                </div>

                <AccordionContent>
                  <CardHoverSection {...project} className={"bg-black"} i={i} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
      {/* <ActionCall /> */}
    </div>
  );
}
