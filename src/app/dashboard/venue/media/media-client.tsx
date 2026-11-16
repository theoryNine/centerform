"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState, SafeImage } from "@/components/dashboard/list-parts";
import { toast } from "@/components/dashboard/toaster";
import { matchesQuery, plural } from "@/lib/dashboard-lists";
import {
  formatBytes,
  UPLOAD_LIMIT_TEXT,
  validateImageFile,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/uploads";
import { cn } from "@/lib/utils";
import { deleteVenueMediaBulkAction, getMediaUsageAction } from "./actions";
import type { VenueMedia } from "@/types";

type UploadStatus = "queued" | "uploading" | "done" | "failed";
interface UploadItem {
  id: number;
  name: string;
  status: UploadStatus;
  progress: number;
  error?: string;
}

// fetch() can't report upload progress, so uploads use XMLHttpRequest.
function uploadFile(
  file: File,
  venueId: string,
  onProgress: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/dashboard/upload");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = "Upload failed.";
      try {
        message = (JSON.parse(xhr.responseText) as { error?: string }).error ?? message;
      } catch {
        // keep the generic message
      }
      reject(new Error(message));
    };
    xhr.onerror = () => reject(new Error("Network error."));
    const body = new FormData();
    body.set("venueId", venueId);
    body.set("file", file);
    xhr.send(body);
  });
}

interface MediaClientProps {
  media: VenueMedia[];
  venueId: string;
}

export function MediaClient({ media: initialMedia, venueId }: MediaClientProps) {
  const router = useRouter();
  const [media, setMedia] = useState(initialMedia);
  const [query, setQuery] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [confirm, setConfirm] = useState<{ usage: Record<string, string[]> } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef(new Map<number, File>());
  const nextId = useRef(1);

  useEffect(() => setMedia(initialMedia), [initialMedia]);

  // --- Uploading ---------------------------------------------------------------------------

  function patch(id: number, changes: Partial<UploadItem>) {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...changes } : q)));
  }

  async function runUpload(id: number) {
    const file = filesRef.current.get(id);
    if (!file) return;
    patch(id, { status: "uploading", progress: 0, error: undefined });
    try {
      await uploadFile(file, venueId, (f) => patch(id, { progress: f }));
      patch(id, { status: "done", progress: 1 });
      filesRef.current.delete(id);
    } catch (err) {
      patch(id, { status: "failed", error: err instanceof Error ? err.message : "Upload failed." });
    }
  }

  async function addFiles(files: File[]) {
    const items: UploadItem[] = files.map((file) => {
      const id = nextId.current++;
      const problem = validateImageFile(file);
      if (!problem) filesRef.current.set(id, file);
      return {
        id,
        name: file.name,
        status: problem ? "failed" : "queued",
        progress: 0,
        error: problem ?? undefined,
      };
    });
    setQueue((prev) => [...prev, ...items]);
    // One at a time keeps the server (and the progress readout) simple.
    for (const item of items) {
      if (item.status === "queued") await runUpload(item.id);
    }
    router.refresh();
  }

  async function retry(id: number) {
    await runUpload(id);
    router.refresh();
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length) void addFiles(files);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") || f.type === "",
    );
    if (files.length) void addFiles(files);
  }

  // --- Selecting and deleting --------------------------------------------------------------

  const visible = media.filter((m) => matchesQuery(query, m.filename));
  const allVisibleSelected = visible.length > 0 && visible.every((m) => selected.has(m.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  async function askDelete() {
    const urls = media.filter((m) => selected.has(m.id)).map((m) => m.url);
    // If the lookup fails we still confirm, just without the in-use detail.
    const usage = await getMediaUsageAction(venueId, urls).catch(() => ({}));
    setConfirm({ usage });
  }

  async function confirmDelete() {
    setDeleting(true);
    const ids = [...selected];
    try {
      const { deleted } = await deleteVenueMediaBulkAction(venueId, ids);
      setMedia((prev) => prev.filter((m) => !selected.has(m.id)));
      toast(`Deleted ${plural(deleted, "image")}.`);
      setConfirm(null);
      exitSelectMode();
      router.refresh();
    } catch {
      toast("Couldn't delete the images. You may not have permission to delete.", "error");
    } finally {
      setDeleting(false);
    }
  }

  const selectedUrls = new Set(media.filter((m) => selected.has(m.id)).map((m) => m.url));
  const inUse = confirm
    ? Object.entries(confirm.usage).filter(([url]) => selectedUrls.has(url))
    : [];
  const uploading = queue.some((q) => q.status === "uploading" || q.status === "queued");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Images</h1>
          <p className="text-muted-foreground">
            {plural(media.length, "image")} in your media library.
          </p>
        </div>
        {media.length > 0 && !selectMode && (
          <Button variant="outline" className="h-10" onClick={() => setSelectMode(true)}>
            Select
          </Button>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border bg-card",
        )}
      >
        <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <Upload aria-hidden className="size-6" />
        </span>
        <p className="text-sm font-medium">Drag images here or choose files</p>
        <Button className="h-10" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
          {uploading ? "Uploading…" : "Choose files"}
        </Button>
        <p className="text-muted-foreground text-xs">{UPLOAD_LIMIT_TEXT}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={onPick}
          aria-label="Choose images to upload"
        />
      </div>

      {/* Upload progress */}
      {queue.length > 0 && (
        <section aria-label="Uploads" className="bg-card space-y-2 rounded-lg border p-3">
          <ul className="space-y-2">
            {queue.map((q) => (
              <li key={q.id} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{q.name}</span>
                  {q.status === "uploading" ? (
                    <progress
                      value={Math.round(q.progress * 100)}
                      max={100}
                      aria-label={`Uploading ${q.name}`}
                      className="accent-primary h-1.5 w-full"
                    />
                  ) : (
                    <span
                      className={cn(
                        "block text-xs",
                        q.status === "failed"
                          ? "font-medium text-red-700 dark:text-red-400"
                          : "text-muted-foreground",
                      )}
                    >
                      {q.status === "queued" && "Waiting"}
                      {q.status === "done" && "Uploaded"}
                      {q.status === "failed" && (q.error ?? "Upload failed")}
                    </span>
                  )}
                </span>
                {q.status === "failed" && filesRef.current.has(q.id) && (
                  <Button variant="outline" className="h-9" onClick={() => void retry(q.id)}>
                    Retry
                  </Button>
                )}
                {(q.status === "done" || q.status === "failed") && (
                  <button
                    type="button"
                    aria-label={`Dismiss ${q.name}`}
                    onClick={() => setQueue((prev) => prev.filter((x) => x.id !== q.id))}
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex size-11 items-center justify-center rounded-md outline-none focus-visible:ring-[3px] md:size-9"
                  >
                    <X aria-hidden className="size-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {media.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No images yet"
          description="Upload photos once, then pick them for your cover, places, events and pages."
        />
      ) : (
        <>
          {selectMode ? (
            <div className="bg-card sticky top-0 z-20 flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 shadow-sm">
              <p aria-live="polite" className="text-sm font-medium">
                {selected.size} selected
              </p>
              <Button
                variant="ghost"
                className="h-9"
                onClick={() =>
                  setSelected(allVisibleSelected ? new Set() : new Set(visible.map((m) => m.id)))
                }
              >
                {allVisibleSelected ? "Clear selection" : "Select all"}
              </Button>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" className="h-10" onClick={exitSelectMode}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="h-10"
                  disabled={selected.size === 0}
                  onClick={() => void askDelete()}
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search images by file name"
                placeholder="Search by file name"
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring/50 h-11 w-full max-w-sm rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] md:h-10"
              />
              <p aria-live="polite" className="text-muted-foreground ml-auto text-sm">
                {query
                  ? `${visible.length} of ${plural(media.length, "image")}`
                  : plural(media.length, "image")}
              </p>
            </div>
          )}

          {visible.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No images match &ldquo;{query}&rdquo;.{" "}
              <button
                type="button"
                className="text-primary dark:text-ring font-medium underline"
                onClick={() => setQuery("")}
              >
                Clear search
              </button>
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visible.map((item) => {
                const isSelected = selected.has(item.id);
                const tile = (
                  <>
                    <span
                      className={cn(
                        "bg-muted relative block aspect-square overflow-hidden rounded-lg border",
                        isSelected && "ring-primary ring-2 ring-offset-2",
                      )}
                    >
                      <SafeImage
                        src={item.url}
                        alt={selectMode ? "" : item.filename}
                        className="size-full object-cover"
                        fallback={
                          <span className="text-muted-foreground flex size-full items-center justify-center">
                            <ImageIcon aria-hidden className="size-8" />
                          </span>
                        }
                      />
                      {selectMode && (
                        <span
                          aria-hidden
                          className={cn(
                            "bg-background absolute top-2 left-2 flex size-6 items-center justify-center rounded-md border-2",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border",
                          )}
                        >
                          {isSelected && <Check className="size-4" strokeWidth={3} />}
                        </span>
                      )}
                    </span>
                    <span className="mt-2 block truncate text-sm font-medium">{item.filename}</span>
                    {item.size ? (
                      <span className="text-muted-foreground block text-xs">
                        {formatBytes(item.size)}
                      </span>
                    ) : null}
                  </>
                );
                return (
                  <li key={item.id}>
                    {selectMode ? (
                      <label className="block cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggle(item.id)}
                          aria-label={`Select ${item.filename}`}
                          className="peer sr-only"
                        />
                        <span className="peer-focus-visible:ring-ring/50 block rounded-lg peer-focus-visible:ring-[3px]">
                          {tile}
                        </span>
                      </label>
                    ) : (
                      <div>{tile}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <AlertDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && !deleting && setConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {plural(selected.size, "image")}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>This permanently deletes the files and can&apos;t be undone.</p>
                {inUse.length > 0 && (
                  <p className="font-medium text-red-700 dark:text-red-400">
                    {plural(inUse.length, "of these images is", "of these images are")} in use (
                    {[...new Set(inUse.flatMap(([, labels]) => labels))].join(", ")}). Anything
                    using {inUse.length === 1 ? "it" : "them"} will lose its image.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep images</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting ? "Deleting…" : `Delete ${plural(selected.size, "image")}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
