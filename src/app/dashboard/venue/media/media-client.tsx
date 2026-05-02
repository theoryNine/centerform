"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteVenueMediaAction } from "./actions";
import type { VenueMedia } from "@/types";

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface MediaClientProps {
  media: VenueMedia[];
  venueId: string;
}

export function MediaClient({ media: initialMedia, venueId }: MediaClientProps) {
  const [media, setMedia] = useState(initialMedia);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Sync server-rendered media into local state after router.refresh()
  useEffect(() => {
    setMedia(initialMedia);
  }, [initialMedia]);

  async function handleUpload(files: FileList) {
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("venueId", venueId);
      formData.append("file", file);

      try {
        await fetch("/api/dashboard/upload", { method: "POST", body: formData });
      } catch {
        // continue with remaining files on individual failure
      }
    }

    setUploading(false);
    // Reset so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  function handleDelete(mediaId: string) {
    // Optimistically remove from local state
    setMedia((prev) => prev.filter((m) => m.id !== mediaId));
    setConfirmDeleteId(null);

    startTransition(async () => {
      await deleteVenueMediaAction(mediaId, venueId);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Images</h1>
          <p className="text-muted-foreground">
            {media.length} {media.length === 1 ? "image" : "images"} in your media library.
          </p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Images"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files?.length && handleUpload(e.target.files)}
        />
      </div>

      {media.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No images yet. Upload your first to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />

              {confirmDeleteId === item.id ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70">
                  <p className="text-xs font-medium text-white">Delete this image?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded px-2 py-1 text-xs text-white/80 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending}
                      className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-2 opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="rounded bg-black/60 p-1.5 text-white transition-colors hover:bg-red-500/90"
                      aria-label="Delete image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="rounded bg-black/60 px-2 py-1">
                    <p className="truncate text-xs text-white">{item.filename}</p>
                    {item.size && (
                      <p className="text-xs text-white/70">{formatBytes(item.size)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
