"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CopyLinkButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API unavailable (e.g. insecure context): fall back to a temporary textarea.
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" variant="outline" className="h-10 flex-1" onClick={copy}>
      {copied ? <Check /> : <Copy />}
      <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
    </Button>
  );
}

// The public guest URL with copy / open actions. Desktop only: phones get a full-width
// "View guest site" button at the end of the page instead.
export function GuestLinkCard({ url, className }: { url: string; className?: string }) {
  return (
    <Card className={`hidden gap-4 md:flex ${className ?? ""}`}>
      <CardHeader>
        <CardTitle>
          <h2 className="text-base">Your guest page</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p
          className="bg-muted/40 truncate rounded-md border px-3 py-2 font-mono text-sm"
          title={url}
        >
          {url}
        </p>
        <div className="flex gap-2">
          <CopyLinkButton text={url} />
          <Button asChild variant="outline" className="h-10 flex-1">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
              View guest site
            </a>
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          This is the page guests open on their phones. Changes usually appear right away.
        </p>
      </CardContent>
    </Card>
  );
}
