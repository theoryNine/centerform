"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export function AccordionItem({ title, children, isOpen, onToggle }: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, children]);

  return (
    <div className="-mx-5 border-b border-border px-5">
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between border-none bg-none py-4 text-left"
      >
        <span className="text-cta-button font-medium text-foreground">{title}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted-foreground transition-transform duration-[250ms] ease-out ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      <div
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
