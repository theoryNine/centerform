// Service "details" blocks: parsing, validation and serialization for the block editor and the
// server action. Pure so it is unit-testable. The shapes are the ServiceDetailsBlock type; the
// database column holds either one block or an array of them, and the editor always writes an array.

import type { ServiceDetails, ServiceDetailsBlock } from "@/types";

export type BlockType = ServiceDetailsBlock["type"];
export const BLOCK_TYPES: { type: BlockType; label: string; hint: string }[] = [
  { type: "text", label: "Text", hint: "A paragraph" },
  { type: "bullets", label: "Bullets", hint: "A short list" },
  {
    type: "kv",
    label: "Key and value",
    hint: "Label and value rows, with an optional copy button",
  },
  { type: "phone", label: "Phone", hint: "A tappable phone number" },
];

const isString = (v: unknown): v is string => typeof v === "string";
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Returns the block if it has exactly the shape the guest site renders, else null. */
export function toBlock(value: unknown): ServiceDetailsBlock | null {
  if (!isRecord(value)) return null;
  switch (value.type) {
    case "text":
      return isString(value.content) ? { type: "text", content: value.content } : null;
    case "bullets":
      return Array.isArray(value.items) && value.items.every(isString)
        ? { type: "bullets", items: [...value.items] }
        : null;
    case "phone":
      return isString(value.label) && isString(value.value)
        ? { type: "phone", label: value.label, value: value.value }
        : null;
    case "kv": {
      if (!Array.isArray(value.rows)) return null;
      const rows: { label: string; value: string; copy?: boolean }[] = [];
      for (const row of value.rows) {
        if (!isRecord(row) || !isString(row.label) || !isString(row.value)) return null;
        if (row.copy !== undefined && typeof row.copy !== "boolean") return null;
        rows.push(
          row.copy
            ? { label: row.label, value: row.value, copy: true }
            : { label: row.label, value: row.value },
        );
      }
      return { type: "kv", rows };
    }
    default:
      return null;
  }
}

export type ParseResult =
  | { ok: true; blocks: ServiceDetailsBlock[] }
  | { ok: false; reason: string };

/**
 * Reads what the database holds (a block, an array of blocks, or nothing). Anything that is not
 * entirely valid blocks is reported as not ok, so the editor can show the raw JSON instead of
 * dropping data.
 */
export function parseServiceDetails(input: unknown): ParseResult {
  if (input === null || input === undefined || input === "") return { ok: true, blocks: [] };
  const list = Array.isArray(input) ? input : [input];
  const blocks: ServiceDetailsBlock[] = [];
  for (let i = 0; i < list.length; i++) {
    const block = toBlock(list[i]);
    if (!block)
      return {
        ok: false,
        reason: `Block ${i + 1} is not a valid text, bullets, key/value or phone block.`,
      };
    blocks.push(block);
  }
  return { ok: true, blocks };
}

/** Parses JSON text (from the raw "Advanced" editor or a form field). */
export function parseServiceDetailsJson(text: string): ParseResult {
  const raw = text.trim();
  if (!raw) return { ok: true, blocks: [] };
  try {
    return parseServiceDetails(JSON.parse(raw));
  } catch {
    return { ok: false, reason: "That is not valid JSON." };
  }
}

/** Drops blocks with nothing in them and trims text, so empty rows are never saved. */
export function cleanBlocks(blocks: ServiceDetailsBlock[]): ServiceDetailsBlock[] {
  const out: ServiceDetailsBlock[] = [];
  for (const block of blocks) {
    if (block.type === "text") {
      const content = block.content.trim();
      if (content) out.push({ type: "text", content });
    } else if (block.type === "bullets") {
      const items = block.items.map((i) => i.trim()).filter(Boolean);
      if (items.length) out.push({ type: "bullets", items });
    } else if (block.type === "phone") {
      const value = block.value.trim();
      if (value) out.push({ type: "phone", label: block.label.trim(), value });
    } else {
      const rows = block.rows
        .map((r) => ({ label: r.label.trim(), value: r.value.trim(), copy: r.copy }))
        .filter((r) => r.label || r.value)
        .map((r) =>
          r.copy
            ? { label: r.label, value: r.value, copy: true }
            : { label: r.label, value: r.value },
        );
      if (rows.length) out.push({ type: "kv", rows });
    }
  }
  return out;
}

/** The value for the `details` form field: a JSON array, or "" when there is nothing to save. */
export function serializeServiceDetails(blocks: ServiceDetailsBlock[]): string {
  const cleaned = cleanBlocks(blocks);
  return cleaned.length ? JSON.stringify(cleaned) : "";
}

/** For the server action: the value to store in the column (always an array, or null). */
export function detailsForStorage(text: string): ServiceDetails | null {
  const result = parseServiceDetailsJson(text);
  if (!result.ok) throw new Error(`Details are not valid: ${result.reason}`);
  const cleaned = cleanBlocks(result.blocks);
  return cleaned.length ? cleaned : null;
}

/** A new, empty block of the given type. */
export function emptyBlock(type: BlockType): ServiceDetailsBlock {
  switch (type) {
    case "text":
      return { type: "text", content: "" };
    case "bullets":
      return { type: "bullets", items: [""] };
    case "kv":
      return { type: "kv", rows: [{ label: "", value: "" }] };
    case "phone":
      return { type: "phone", label: "", value: "" };
  }
}
