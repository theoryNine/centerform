"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// A tiny toast system: call toast("message") from anywhere in a client component, and the
// <Toaster /> mounted in the dashboard layout shows it. Errors use role="alert".

type Tone = "info" | "error";
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

const listeners = new Set<(t: ToastItem) => void>();
let nextId = 1;

export function toast(message: string, tone: Tone = "info") {
  const item = { id: nextId++, message, tone };
  listeners.forEach((l) => l(item));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onToast = (item: ToastItem) => {
      setItems((prev) => [...prev.slice(-2), item]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== item.id)), 7000);
    };
    listeners.add(onToast);
    return () => void listeners.delete(onToast);
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4"
    >
      {items.map((t) => (
        <div
          key={t.id}
          role={t.tone === "error" ? "alert" : "status"}
          className={cn(
            "pointer-events-auto flex max-w-md items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg",
            t.tone === "error"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-border bg-card text-card-foreground",
          )}
        >
          <p className="flex-1">{t.message}</p>
          <button
            type="button"
            aria-label="Dismiss"
            className="focus-visible:ring-ring/50 -m-2 inline-flex size-11 shrink-0 items-center justify-center rounded-md outline-none hover:bg-black/5 focus-visible:ring-[3px] md:size-8"
            onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
