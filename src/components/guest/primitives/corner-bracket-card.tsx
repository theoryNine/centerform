import { cn } from "@/lib/utils";

interface CornerBracketCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card with decorative corner brackets. Requires `relative` positioning
 * (included by default via the base className).
 */
export function CornerBracketCard({ children, className }: CornerBracketCardProps) {
  return (
    <div className={cn("card-shadow relative rounded-default bg-card px-4 py-6 text-center", className)}>
      <span
        className="absolute inline-block h-4 w-4 border-l-2 border-t-2 border-foreground/25"
        style={{ top: 10, left: 10 }}
      />
      <span
        className="absolute inline-block h-4 w-4 border-r-2 border-t-2 border-foreground/25"
        style={{ top: 10, right: 10 }}
      />
      <span
        className="absolute inline-block h-4 w-4 border-b-2 border-l-2 border-foreground/25"
        style={{ bottom: 10, left: 10 }}
      />
      <span
        className="absolute inline-block h-4 w-4 border-b-2 border-r-2 border-foreground/25"
        style={{ bottom: 10, right: 10 }}
      />
      {children}
    </div>
  );
}
