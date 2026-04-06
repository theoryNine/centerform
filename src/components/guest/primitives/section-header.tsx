interface SectionHeaderProps {
  number: string;
  title: string;
}

export function SectionHeader({ number, title }: SectionHeaderProps) {
  return (
    <div className="pb-2 pt-6">
      <div className="flex items-baseline gap-2">
        <span className="text-section-number font-medium text-primary">{number}</span>
        <span className="text-section-number text-muted-foreground">·</span>
        <h2 className="m-0 font-serif text-section-heading font-normal text-foreground">{title}</h2>
      </div>
      <div className="-ml-page mt-2 h-px w-[calc(60%+var(--cf-page-padding))] bg-primary" />
    </div>
  );
}
