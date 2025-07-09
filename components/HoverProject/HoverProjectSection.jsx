"use client";
import projects from "@/app/data";
import styles from "./style.module.scss";
import ListElement from "./link";
import { useRef, useState } from "react";
import ActionCall from "../ActionCall/ActionCall";
export default function HoverProjectSection() {
  const [modal, setModal] = useState({ active: false, index: 0 });

  return (
    <div id='projects' className='mb-[15dvh] w-full text-white'>
      <div className='mx-4 relative mb-8 md:mb-0'>
        {/* <MarqueeButton modal={modal} projects={projects} /> */}
        {projects.map((project, i) => {
          return (
            <div key={i} className='hidden md:block'>
              <div
                onMouseEnter={() => {
                  setModal({ active: true, i });
                }}
                onMouseLeave={() => {
                  setModal({ active: false, i });
                }}
                className='relative'
              >
                <div className={styles.menu}>
                  <div className={styles.body}>
                    <ListElement project={project} />
                  </div>
                </div>
              </div>
              <div className='block md:hidden'>
                <div className='relative'>
                  <div className={styles.menu}>
                    <div className={styles.body}>
                      <ListElement project={project} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* <Accordion
          type='single'
          collapsible
          className='w-full relative'
        >
          {projects.map((project, i) => {
            return (
              <AccordionItem key={i} value={`item-${i + 1}`}>
                <div className='hidden md:block'>
                  <AccordionTrigger
                    onMouseEnter={() => {
                      setModal({ active: true, i });
                    }}
                    onMouseLeave={() => {
                      setModal({ active: false, i });
                    }}
                    className='relative'
                  >
                    <div className={styles.menu}>
                      <div className={styles.body}>
                        <ListElement project={project} />
                      </div>
                    </div>
                  </AccordionTrigger>
                </div>
                <div className='block md:hidden'>
                  <AccordionTrigger className='relative'>
                    <div className={styles.menu}>
                      <div className={styles.body}>
                        <ListElement project={project} />
                      </div>
                    </div>
                  </AccordionTrigger>
                </div>

                <AccordionContent>
                  <CardHoverSection
                    {...project}
                    className={"bg-black"}
                    i={i}
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion> */}
      </div>
      {/* <ActionCall /> */}
    </div>
  );
}
