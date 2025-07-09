import * as AccordionPrimitive from "@radix-ui/react-accordion";

import { cn } from "@/lib/utils";

function Accordion({ ...props }) {
  return <AccordionPrimitive.Root data-slot='accordion' {...props} />;
}

function AccordionItem({ className, ...props }) {
  return (
    <AccordionPrimitive.Item
      data-slot='accordion-item'
      className={cn("pb-1", className)}
      {...props}
    />
  );
}

function AccordionTrigger({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Header className='flex'>
      <AccordionPrimitive.Trigger
        data-slot='accordion-trigger'
        className={cn(
          "hover:cursor-pointer uppercase flex flex-1 items-start justify-between rounded-md text-left transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Content
      data-slot='accordion-content'
      className='data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden'
      {...props}
    >
      <div className={cn("", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
};
