"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { listVenueMediaAction, deleteVenueMediaAction } from "@/app/dashboard/venue/media/actions";
import { useNotifyForm } from "@/components/dashboard/notify-form";
import type { VenueMedia } from "@/types";

interface ImageUploadProps {
  name: string;
  defaultValue?: string | null;
  venueId: string;
  /** 72px thumbnail beside the buttons instead of a large preview above them. */
  compact?: boolean;
  /** What the image is for ("Services page image"). Makes the buttons' names unique when a page has
   * several of these ("Replace Services page image"). */
  label?: string;
  /** For a page image that falls back to another image (the cover): pass that image (or null if
   * there is none). The row then shows it as "Using default" until the owner picks their own, with
   * Change / Choose image / Use default wording. Use with `compact`. */
  fallbackUrl?: string | null;
}

export function ImageUpload({
  name,
  defaultValue,
  venueId,
  compact = false,
  label,
  fallbackUrl,
}: ImageUploadProps) {
  const hasFallback = fallbackUrl !== undefined;
  // An accessible name must contain the visible text (WCAG 2.5.3); the label makes it unique.
  const named = (visible: string) => (label ? `${visible}, ${label}` : undefined);
  const [value, setValue] = useState(defaultValue ?? "");
  const uploadText = hasFallback
    ? value
      ? "Change"
      : "Choose image"
    : value
      ? "Replace"
      : "Upload Image";
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  useNotifyForm(hiddenRef, value);
  const [showLibrary, setShowLibrary] = useState(false);
  const [media, setMedia] = useState<VenueMedia[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showLibrary || media.length > 0) return;
    setLoadingLibrary(true);
    listVenueMediaAction(venueId)
      .then(setMedia)
      .finally(() => setLoadingLibrary(false));
  }, [showLibrary, venueId, media.length]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("venueId", venueId);
      const res = await fetch("/api/dashboard/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = (await res.json()) as { url: string };
      setValue(url);
      // Prepend to library so it appears immediately if opened
      setMedia((prev) => [
        {
          id: crypto.randomUUID(),
          venue_id: venueId,
          url,
          filename: file.name,
          size: file.size,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch {
      setError(
        "Upload failed. Use a JPG, PNG, WebP, GIF, AVIF or HEIC image under 10 MB (SVG isn't supported).",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSelect(url: string) {
    setValue(url);
    setShowLibrary(false);
  }

  async function handleDeleteMedia(mediaId: string, url: string) {
    setMedia((prev) => prev.filter((m) => m.id !== mediaId));
    if (value === url) setValue("");
    await deleteVenueMediaAction(mediaId, venueId).catch(() => {});
  }

  return (
    <div className="space-y-2" role={label ? "group" : undefined} aria-label={label}>
      <input ref={hiddenRef} type="hidden" name={name} value={value} />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className={compact ? "flex items-center gap-3" : "space-y-2"}>
        {compact ? (
          <div className="border-border bg-muted size-[72px] shrink-0 overflow-hidden rounded-md border">
            {(value || fallbackUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                loading="lazy"
                decoding="async"
                src={value || fallbackUrl || ""}
                alt={
                  value
                    ? label
                      ? `${label} preview`
                      : "Selected image preview"
                    : label
                      ? `${label}: default image`
                      : "Default image"
                }
                className={`size-full object-cover ${value ? "" : "opacity-80"}`}
              />
            )}
          </div>
        ) : (
          value && (
            <div className="rounded-default border-border relative overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                loading="lazy"
                decoding="async"
                src={value}
                alt={label ? `${label} preview` : "Selected image preview"}
                className="bg-muted max-h-48 w-full object-contain"
              />
            </div>
          )
        )}

        <div className={compact ? "min-w-0 flex-1 space-y-2" : undefined}>
          {hasFallback && !value && (
            <p className="text-muted-foreground text-xs font-medium">
              {fallbackUrl ? "Using default" : "No image yet"}
            </p>
          )}
          <div className={compact ? "flex flex-wrap gap-2" : "flex gap-2"}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hover:bg-muted hover:text-foreground flex-1"
              disabled={uploading}
              aria-label={named(uploading ? "Uploading…" : uploadText)}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "Uploading…" : uploadText}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hover:bg-muted hover:text-foreground flex-1"
              aria-label={named(showLibrary ? "Hide Library" : "Library")}
              aria-expanded={showLibrary}
              onClick={() => setShowLibrary((v) => !v)}
            >
              {showLibrary ? "Hide Library" : "Library"}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="px-2 text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                aria-label={named(hasFallback ? "Use default" : "Remove")}
                onClick={() => setValue("")}
              >
                {hasFallback ? "Use default" : "Remove"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {showLibrary && (
        <div className="border-border rounded-default border p-2">
          {loadingLibrary ? (
            <p className="text-muted-foreground py-4 text-center text-xs">Loading…</p>
          ) : media.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-xs">
              No images uploaded yet. Upload one above.
            </p>
          ) : (
            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto">
              {media.map((item) => (
                <div
                  key={item.id}
                  className={`group rounded-default relative aspect-square overflow-hidden border-2 transition-colors ${
                    value === item.url ? "border-primary" : "hover:border-border border-transparent"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(item.url)}
                    className="focus-visible:ring-ring absolute inset-0 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      loading="lazy"
                      decoding="async"
                      src={item.url}
                      alt={item.filename}
                      className="h-full w-full object-cover"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMedia(item.id, item.url);
                    }}
                    aria-label={`Delete ${item.filename} from the library`}
                    className="absolute top-1 right-1 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600 focus-visible:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
