// Client-side checks for image uploads. They mirror the limits enforced by POST
// /api/dashboard/upload (which stays the source of truth) so a bad file fails right away.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
];
export const UPLOAD_LIMIT_TEXT = "JPG, PNG, WebP, GIF, AVIF or HEIC, up to 10 MB each";

/** A message if the file can't be uploaded, else null. */
export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Unsupported file type (SVG isn't allowed).";
  if (file.size > MAX_UPLOAD_BYTES) return "Too large (max 10 MB).";
  if (file.size === 0) return "The file is empty.";
  return null;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
