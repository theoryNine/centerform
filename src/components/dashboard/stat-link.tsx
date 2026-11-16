import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface StatLinkProps {
  label: string;
  value: number;
  href: string;
  /** Link text, e.g. "Manage events". Visible from `md` up; screen-reader only on phones. */
  linkText: string;
}

// An Overview stat that is also a link: the whole card is the click target.
export function StatLink({ label, value, href, linkText }: StatLinkProps) {
  return (
    <Link
      href={href}
      className="group bg-card text-card-foreground hover:border-foreground/40 focus-visible:ring-ring/50 block rounded-xl border p-4 shadow-sm transition-colors outline-none focus-visible:ring-[3px] md:p-6"
    >
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
      <p className="mt-3 text-3xl font-bold md:mt-4">{value}</p>
      <p className="text-primary dark:text-ring sr-only items-center gap-1 text-sm font-medium md:not-sr-only md:mt-3 md:flex">
        {linkText}
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform group-hover:translate-x-0.5"
        />
      </p>
    </Link>
  );
}
