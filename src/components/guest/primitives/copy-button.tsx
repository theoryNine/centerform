"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex cursor-pointer items-center gap-1 border-none bg-none p-0 text-[13px] font-semibold text-primary"
    >
      {label && <span>{label}</span>}
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}
