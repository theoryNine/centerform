"use client";

import { useId, useRef, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  /**
   * For wide-frame pages: from 600px each item is its own rounded card (put them in a grid with
   * `items-start` so an open card doesn't stretch its neighbour) with a 56px-high summary.
   */
  wide?: boolean;
}

export function AccordionItem({ title, children, isOpen, onToggle, wide }: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const panelId = useId();

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, children]);

  return (
    <div
      className={`-mx-5 border-b border-border px-5${
        wide ? " cmp:card-shadow cmp:mx-0 cmp:rounded-default cmp:border-b-0 cmp:bg-card" : ""
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={`flex w-full cursor-pointer items-center justify-between border-none bg-none py-4 text-left${
          wide ? " cmp:min-h-14" : ""
        }`}
      >
        <span className="text-cta-button font-medium text-foreground">{title}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted-foreground transition-transform duration-[250ms] ease-out ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      <div
        id={panelId}
        inert={!isOpen}
        className="overflow-hidden transition-[height] duration-[250ms] ease-out"
        style={{ height: isOpen ? contentHeight : 0 }}
      >
        <div ref={contentRef} className="pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}
