"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { listVenueMediaAction, deleteVenueMediaAction } from "@/app/dashboard/venue/media/actions";
import type { VenueMedia } from "@/types";

interface ImageUploadProps {
  name: string;
  defaultValue?: string | null;
  venueId: string;
}

export function ImageUpload({ name, defaultValue, venueId }: ImageUploadProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
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
        { id: crypto.randomUUID(), venue_id: venueId, url, filename: file.name, size: file.size, created_at: new Date().toISOString() },
        ...prev,
      ]);
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
    <div className="space-y-2">
      <input type="hidden" name={name} value={value} />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {value && (
        <div className="relative rounded-default overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-36 object-cover" />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 hover:bg-muted hover:text-foreground"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Uploading…" : value ? "Replace" : "Upload Image"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 hover:bg-muted hover:text-foreground"
          onClick={() => setShowLibrary((v) => !v)}
        >
          {showLibrary ? "Hide Library" : "Library"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive px-2"
            onClick={() => setValue("")}
          >
            Remove
          </Button>
        )}
      </div>

      {showLibrary && (
        <div className="border border-border rounded-default p-2">
          {loadingLibrary ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Loading…</p>
          ) : media.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No images uploaded yet. Upload one above.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {media.map((item) => (
                <div
                  key={item.id}
                  className={`group relative aspect-square rounded-default overflow-hidden border-2 transition-colors ${
                    value === item.url ? "border-primary" : "border-transparent hover:border-border"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(item.url)}
                    className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteMedia(item.id, item.url); }}
                    className="absolute right-1 top-1 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 bg-black/60 text-white hover:bg-red-600"
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
