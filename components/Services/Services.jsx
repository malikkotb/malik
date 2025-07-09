"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";

export default function Services() {
  const [open, setOpen] = useState(null); // currently active accordion
  const [closing, setClosing] = useState(null); // the one that's fading out

  // Toggle accordion functionality
  const toggleAccordion = (section) => {
    if (open === section) {
      setOpen(null); // just close
    } else {
      setClosing(open); // start closing previous
      setOpen(section); // open new one right away
    }
  };

  return (
    <div className='pb-10' id='services'>
      <h2 className='h2 pb-4'>Services</h2>
      <div className='w-full'>
        <Accordion
          type='single'
          collapsible
          className='w-full text-sm'
          // defaultValue="item-1"
        >
          <AccordionItem value='item-1'>
            <AccordionTrigger>Creative Development</AccordionTrigger>
            <AccordionContent className='flex flex-col '>
              Need design and development? I got u. Lorem ipsum dolor
              sit, amet consectetur adipisicing elit. Molestias illo
              perspiciatis sint repellat? Accusamus nemo dignissimos
              unde iusto expedita eos provident, modi quidem dolorum,
              sit odio magni at exercitationem deleniti. q
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-2'>
            <AccordionTrigger>Frontend Development</AccordionTrigger>
            <AccordionContent className='flex flex-col '>
              Lorem ipsum dolor sit, amet consectetur adipisicing
              elit. Molestias illo perspiciatis sint repellat?
              Accusamus nemo dignissimos unde iusto expedita eos
              provident, modi quidem dolorum, sit odio magni at
              exercitationem deleniti. 2
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-3'>
            <AccordionTrigger>
              Interaction Development
            </AccordionTrigger>
            <AccordionContent className='flex flex-col '>
              Have an animation in my mind? I can bring it to life.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-4'>
            <AccordionTrigger>DESIGN SYSTEMS</AccordionTrigger>
            <AccordionContent className='flex flex-col '>
              Lorem ipsum dolor sit, amet consectetur adipisicing
              elit. Molestias illo perspiciatis sint repellat?
              Accusamus nemo dignissimos unde iusto expedita eos
              provident, modi quidem dolorum, sit odio magni at
              exercitationem deleniti. 4
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-5'>
            <AccordionTrigger>CMS Integration</AccordionTrigger>
            <AccordionContent className='flex flex-col'>
              Lorem ipsum dolor sit, amet consectetur adipisicing
              elit. Molestias illo perspiciatis sint repellat?
              Accusamus nemo dignissimos unde iusto expedita eos
              provident, modi quidem dolorum, sit odio magni at
              exercitationem deleniti. 5
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-6'>
            <AccordionTrigger>Three-D Development</AccordionTrigger>
            <AccordionContent className='flex flex-col '>
              Lorem ipsum dolor sit, amet consectetur adipisicing
              elit. Molestias illo perspiciatis sint repellat?
              Accusamus nemo dignissimos unde iusto expedita eos
              provident, modi quidem dolorum, sit odio magni at
              exercitationem deleniti. 6
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-7'>
            <AccordionTrigger>
              E-Commerce Development
            </AccordionTrigger>
            <AccordionContent className='flex flex-col '>
              Looking to build an e-commerce store? I can help you
              with custom solutions using hydrogen/shopify. A
              framework by shopify where you can build your own custom
              e-commerce storefronts.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-8'>
            <AccordionTrigger>Webflow Development</AccordionTrigger>
            <AccordionContent className='flex flex-col '>
              Build anything with webflow. I can help you with custom
              solutions using webflow. Benefits of using webflow: Ease
              to use after develpoment, CMS Integration is flawless.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
