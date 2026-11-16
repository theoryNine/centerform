"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type ScreenReaderInstructions,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const INSTRUCTIONS: ScreenReaderInstructions = {
  draggable:
    "To pick up an item, press space. Use the arrow keys to move it, space to drop it, and escape to cancel. The up and down buttons on each item also reorder it.",
};

interface SortableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  /** Spoken name of an item in drag announcements ("Fireside Bar"). */
  getName: (item: T) => string;
  onReorder: (next: T[]) => void;
  /** Render one item. `handle` is the drag handle button; place it where you want it. */
  renderItem: (item: T, index: number, handle: React.ReactNode) => React.ReactNode;
  /** Classes for each item's wrapper (the <li>). */
  itemClassName?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * A vertical list that can be reordered by dragging (mouse, touch) or with the keyboard on the
 * drag handle. Moves are announced to screen readers. The parent still offers up/down buttons
 * as the simple keyboard alternative and is told the new order through `onReorder`.
 */
export function SortableList<T>({
  items,
  getId,
  getName,
  onReorder,
  renderItem,
  itemClassName,
  className,
  disabled,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = items.map(getId);
  const nameOf = (id: string | number) => {
    const item = items.find((i) => getId(i) === id);
    return item ? getName(item) : "item";
  };
  const position = (id: string | number) => `${ids.indexOf(String(id)) + 1} of ${ids.length}`;

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      `Picked up ${nameOf(active.id)}. It is at position ${position(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${nameOf(active.id)} is over position ${position(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `Moved ${nameOf(active.id)} to position ${position(over.id)}.`
        : `Dropped ${nameOf(active.id)}. It stays at position ${position(active.id)}.`,
    onDragCancel: ({ active }) =>
      `Cancelled. ${nameOf(active.id)} stays at position ${position(active.id)}.`,
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{ announcements, screenReaderInstructions: INSTRUCTIONS }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={className}>
          {items.map((item, index) => (
            <SortableRow
              key={getId(item)}
              id={getId(item)}
              name={getName(item)}
              className={itemClassName}
              disabled={disabled}
              render={(handle) => renderItem(item, index, handle)}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  name,
  className,
  disabled,
  render,
}: {
  id: string;
  name: string;
  className?: string;
  disabled?: boolean;
  render: (handle: React.ReactNode) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      disabled={disabled}
      aria-label={`Drag to reorder ${name}`}
      className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 inline-flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-md outline-none focus-visible:ring-[3px] active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50 md:size-9"
    >
      <GripVertical aria-hidden className="size-5" />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        className,
        isDragging &&
          "bg-card ring-primary/40 relative z-10 rounded-lg opacity-95 shadow-lg ring-2",
      )}
    >
      {render(handle)}
    </li>
  );
}
