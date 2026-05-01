"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  activeParam?: { key: string; value: string };
}

export function NavLink({ href, children, exact = false, activeParam }: NavLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hrefPath = href.split("?")[0];
  const pathnameMatch = exact ? pathname === hrefPath : pathname === hrefPath || pathname.startsWith(hrefPath + "/");
  const isActive = activeParam
    ? pathnameMatch && searchParams.get(activeParam.key) === activeParam.value
    : pathnameMatch;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {children}
    </Link>
  );
}
