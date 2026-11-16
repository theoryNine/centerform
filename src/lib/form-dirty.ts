// Dirty tracking for dashboard forms: snapshot every named field as a string and diff snapshots.

export type FormSnapshot = Record<string, string>;

/** Reads every named field of a form into a flat record. Files are ignored (uploads go through
 * the upload route and arrive as a hidden URL field). Repeated names are joined with a newline. */
export function snapshotForm(form: HTMLFormElement): FormSnapshot {
  const out: FormSnapshot = {};
  for (const [key, value] of new FormData(form).entries()) {
    if (typeof value !== "string") continue;
    out[key] = key in out ? `${out[key]}\n${value}` : value;
  }
  return out;
}

/** Names of the fields whose value differs between `baseline` and `current`. */
export function changedFields(baseline: FormSnapshot, current: FormSnapshot): string[] {
  const names = new Set([...Object.keys(baseline), ...Object.keys(current)]);
  return [...names].filter((name) => (baseline[name] ?? "") !== (current[name] ?? ""));
}

export function unsavedLabel(count: number): string {
  return count === 1 ? "1 unsaved change" : `${count} unsaved changes`;
}
