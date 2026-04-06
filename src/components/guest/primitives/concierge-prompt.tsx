"use client";

import { useRouter } from "next/navigation";

interface ConciergePromptProps {
  slug: string;
  placeholder?: string;
  chips?: string[];
}

export function ConciergePrompt({
  slug,
  placeholder = "What are you looking for?",
  chips = ["Dinner tonight", "Coffee nearby", "Late checkout", "Happy hour"],
}: ConciergePromptProps) {
  const router = useRouter();

  return (
    <div className="card-shadow rounded-default bg-card p-card">
      <button
        onClick={() => router.push(`/${slug}/concierge`)}
        className="mb-3 w-full cursor-pointer rounded-default border border-border bg-background px-4 py-3 text-left text-body-sm text-muted-foreground"
      >
        {placeholder}
      </button>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => router.push(`/${slug}/concierge`)}
            className="cursor-pointer whitespace-nowrap rounded-chip border border-border bg-transparent px-4 py-2 text-body-sm text-foreground transition-colors duration-150 ease-out hover:bg-secondary"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
