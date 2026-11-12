import type { ReactNode } from "react";

/** One labelled fact (address, hours, price, phone…) as a hairline-separated row. */
export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-border py-4">
      <p className="m-0 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
