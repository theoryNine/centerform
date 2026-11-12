interface SectionHeaderProps {
  number: string;
  title: string;
  /**
   * For wide-frame pages. From 600px the teal rule starts at the content edge and is 50% wide
   * from 700px; at 1024px the heading grows to 36px over a full-width hairline.
   */
  wide?: boolean;
}

export function SectionHeader({ number, title, wide }: SectionHeaderProps) {
  return (
    <div className={`pb-2 pt-6${wide ? " cmp:pt-8 lg:pt-12" : ""}`}>
      <div className="flex items-baseline gap-2">
        <span className="text-section-number font-medium text-primary">{number}</span>
        <span className="text-section-number text-muted-foreground">·</span>
        {/* Plain strings, not cn(): tailwind-merge drops the custom text-section-heading size
            when text-foreground is present. */}
        <h2
          className={`m-0 font-serif text-section-heading font-medium text-foreground${
            wide ? " lg:text-[36px]" : ""
          }`}
        >
          {title}
        </h2>
      </div>
      <div
        className={`-ml-page mt-2 h-px w-[calc(60%+var(--cf-page-padding))] bg-primary${
          wide ? " cmp:ml-0 cmp:w-[70%] tab:w-1/2 lg:w-full lg:bg-border" : ""
        }`}
      />
    </div>
  );
}
