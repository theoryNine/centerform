// Returns the URL if it is an absolute http(s) URL, otherwise null.
// Used to keep javascript:, data: and other schemes out of hrefs and redirects.
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

// For server actions: empty input becomes null, invalid input throws.
export function parseOptionalHttpUrl(
  value: FormDataEntryValue | null,
  label: string,
): string | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  const safe = safeHttpUrl(raw);
  if (!safe) throw new Error(`${label} must be a valid http(s) URL.`);
  return raw;
}
