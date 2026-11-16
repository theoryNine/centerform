"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SortableList } from "@/components/dashboard/sortable";
import {
  BLOCK_TYPES,
  cleanBlocks,
  emptyBlock,
  parseServiceDetails,
  parseServiceDetailsJson,
  serializeServiceDetails,
} from "@/lib/service-details";
import type { ServiceDetails, ServiceDetailsBlock } from "@/types";

interface Item {
  id: string;
  block: ServiceDetailsBlock;
}

let counter = 0;
const newId = () => `block-${++counter}`;
const labelOf = (type: ServiceDetailsBlock["type"]) =>
  BLOCK_TYPES.find((b) => b.type === type)?.label ?? type;

interface ServiceDetailsEditorProps {
  /** What the database holds: a block, an array of blocks, or null. */
  defaultValue: ServiceDetails | null;
}

/**
 * Block editor for a service's details. Submits a JSON array in the `details` field. If the
 * stored value isn't made of valid blocks, nothing is lost: it is shown as raw JSON and left
 * unchanged (`details_keep`) until the owner applies a fix or starts over.
 */
export function ServiceDetailsEditor({ defaultValue }: ServiceDetailsEditorProps) {
  const initial = parseServiceDetails(defaultValue);
  const [items, setItems] = useState<Item[]>(() =>
    initial.ok ? initial.blocks.map((block) => ({ id: newId(), block })) : [],
  );
  // Set while the stored value can't be shown as blocks.
  const [unreadable, setUnreadable] = useState<string | null>(
    initial.ok ? null : JSON.stringify(defaultValue, null, 2),
  );
  const [draft, setDraft] = useState<string | null>(null); // raw JSON being edited (null: follow the blocks)
  const [draftError, setDraftError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const blocks = items.map((i) => i.block);
  const serialized = serializeServiceDetails(blocks);
  const jsonText = unreadable ?? draft ?? JSON.stringify(cleanBlocks(blocks), null, 2);

  // Any change to the blocks drops a half-edited raw JSON draft, so the two never disagree.
  function edit(updater: (prev: Item[]) => Item[]) {
    setItems(updater);
    setDraft(null);
  }

  function update(id: string, block: ServiceDetailsBlock) {
    edit((prev) => prev.map((i) => (i.id === id ? { ...i, block } : i)));
  }

  function move(index: number, to: number) {
    if (to < 0 || to >= items.length) return;
    edit((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setAnnouncement(
      `Moved ${labelOf(items[index].block.type)} block to position ${to + 1} of ${items.length}.`,
    );
  }

  function applyJson() {
    const result = parseServiceDetailsJson(unreadable ?? draft ?? "");
    if (!result.ok) {
      setDraftError(result.reason);
      return;
    }
    setItems(result.blocks.map((block) => ({ id: newId(), block })));
    setUnreadable(null);
    setDraft(null);
    setDraftError(null);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="details" value={unreadable ? "" : serialized} />
      {unreadable && <input type="hidden" name="details_keep" value="true" />}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {unreadable ? (
        <div
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
        >
          These details are in a format the editor can&apos;t show as blocks. They are kept exactly
          as they are unless you fix them below or start over.
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
          No details yet. Add a block for text, a list, key and value rows, or a phone number.
        </p>
      ) : (
        <SortableList
          items={items}
          getId={(i) => i.id}
          getName={(i) => `${labelOf(i.block.type)} block`}
          onReorder={(next) => edit(() => next)}
          className="space-y-3"
          renderItem={(item, index, handle) => (
            <div className="bg-card rounded-lg border">
              <div className="flex items-center gap-1 border-b px-2 py-1">
                {handle}
                <span className="flex-1 text-sm font-medium">{labelOf(item.block.type)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  className="size-11 md:size-9"
                  aria-label={`Move ${labelOf(item.block.type)} block up`}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ChevronUp aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="size-11 md:size-9"
                  aria-label={`Move ${labelOf(item.block.type)} block down`}
                  disabled={index === items.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ChevronDown aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="size-11 text-red-700 hover:text-red-800 md:size-9 dark:text-red-400 dark:hover:text-red-300"
                  aria-label={`Remove ${labelOf(item.block.type)} block`}
                  onClick={() => edit((prev) => prev.filter((i) => i.id !== item.id))}
                >
                  <Trash2 aria-hidden />
                </Button>
              </div>
              <div className="space-y-3 p-3">
                <BlockBody block={item.block} onChange={(b) => update(item.id, b)} />
              </div>
            </div>
          )}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" className="h-10 w-full" disabled={!!unreadable}>
            <Plus aria-hidden /> Add block
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {BLOCK_TYPES.map((b) => (
            <DropdownMenuItem
              key={b.type}
              onSelect={() => edit((prev) => [...prev, { id: newId(), block: emptyBlock(b.type) }])}
            >
              <span>
                <span className="block font-medium">{b.label}</span>
                <span className="text-muted-foreground block text-xs">{b.hint}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <details open={!!unreadable} className="rounded-lg border">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
          Advanced: edit as JSON
        </summary>
        <div className="space-y-2 border-t p-3">
          <Textarea
            aria-label="Details as JSON"
            rows={8}
            value={jsonText}
            spellCheck={false}
            className="font-mono text-xs"
            onChange={(e) => {
              if (unreadable) setUnreadable(e.target.value);
              else setDraft(e.target.value);
              setDraftError(null);
            }}
          />
          {draftError && (
            <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
              {draftError}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-9" onClick={applyJson}>
              Apply JSON
            </Button>
            {unreadable && (
              <Button
                type="button"
                variant="ghost"
                className="h-9 text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                onClick={() => {
                  setUnreadable(null);
                  setItems([]);
                  setDraft(null);
                }}
              >
                Start over
              </Button>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}

function BlockBody({
  block,
  onChange,
}: {
  block: ServiceDetailsBlock;
  onChange: (block: ServiceDetailsBlock) => void;
}) {
  if (block.type === "text") {
    return (
      <Textarea
        aria-label="Text"
        rows={3}
        value={block.content}
        placeholder="A short paragraph for guests."
        onChange={(e) => onChange({ type: "text", content: e.target.value })}
      />
    );
  }

  if (block.type === "bullets") {
    return (
      <div className="space-y-1">
        <Textarea
          aria-label="Bullets, one per line"
          rows={4}
          value={block.items.join("\n")}
          placeholder={"Breakfast 7–10am\nPool towels at the desk"}
          onChange={(e) => onChange({ type: "bullets", items: e.target.value.split("\n") })}
        />
        <p className="text-muted-foreground text-xs">One bullet per line.</p>
      </div>
    );
  }

  if (block.type === "phone") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Input
          aria-label="Phone label"
          value={block.label}
          placeholder="Front desk"
          onChange={(e) => onChange({ ...block, label: e.target.value })}
        />
        <Input
          aria-label="Phone number"
          type="tel"
          value={block.value}
          placeholder="+1 206 555 0123"
          onChange={(e) => onChange({ ...block, value: e.target.value })}
        />
      </div>
    );
  }

  const setRow = (i: number, patch: Partial<{ label: string; value: string; copy: boolean }>) =>
    onChange({ type: "kv", rows: block.rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) });

  return (
    <div className="space-y-3">
      {block.rows.map((row, i) => (
        <div key={i} className="bg-muted/40 space-y-2 rounded-md p-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              aria-label={`Row ${i + 1} label`}
              value={row.label}
              placeholder="Network"
              onChange={(e) => setRow(i, { label: e.target.value })}
            />
            <Input
              aria-label={`Row ${i + 1} value`}
              value={row.value}
              placeholder="Guest Wi-Fi"
              onChange={(e) => setRow(i, { value: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex min-h-9 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!row.copy}
                onChange={(e) => setRow(i, { copy: e.target.checked })}
                className="accent-primary size-4"
              />
              Copy button
            </label>
            <Button
              type="button"
              variant="ghost"
              className="h-9 text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              aria-label={`Remove row ${i + 1}`}
              onClick={() => onChange({ type: "kv", rows: block.rows.filter((_, j) => j !== i) })}
            >
              Remove row
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="h-9"
        onClick={() => onChange({ type: "kv", rows: [...block.rows, { label: "", value: "" }] })}
      >
        <Plus aria-hidden /> Add row
      </Button>
    </div>
  );
}
