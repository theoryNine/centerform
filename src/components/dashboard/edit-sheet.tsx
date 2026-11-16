"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** Error text for a failed server action. Production masks the real message, so keep it generic. */
export function describeActionError(
  err: unknown,
  verb: "save" | "delete" | "update" = "save",
): string {
  const detail = err instanceof Error && err.message ? ` ${err.message}` : "";
  return process.env.NODE_ENV === "production"
    ? `Couldn't ${verb}. Check the fields and try again.`
    : `Couldn't ${verb}.${detail}`;
}

interface UseEditSheetOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Runs with the form's data. Throw to show an error. */
  save: (data: FormData) => Promise<void>;
  /** Runs when delete is confirmed (edit mode only). */
  remove?: () => Promise<void>;
  /** Return a message to stop the save (client-side checks). */
  validate?: (data: FormData) => string | null;
}

/**
 * The shared submit/delete behavior of the dashboard's edit sheets: pending state, an inline
 * error, the inline delete confirmation, closing and refreshing on success.
 */
export function useEditSheet({ open, onOpenChange, save, remove, validate }: UseEditSheetOptions) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The sheet component stays mounted between uses: start clean each time it opens.
  useEffect(() => {
    if (open) {
      setConfirmDelete(false);
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    const problem = validate?.(data);
    if (problem) {
      setError(problem);
      return;
    }
    setPending(true);
    setError(null);
    try {
      await save(data);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(describeActionError(err, "save"));
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!remove || pending) return;
    setPending(true);
    setError(null);
    try {
      await remove();
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(describeActionError(err, "delete"));
    } finally {
      setPending(false);
      setConfirmDelete(false);
    }
  }

  return { pending, error, confirmDelete, setConfirmDelete, handleSubmit, handleDelete };
}

interface EditSheetFooterProps {
  isEdit: boolean;
  pending: boolean;
  confirmDelete: boolean;
  onConfirmDelete: (confirming: boolean) => void;
  onDelete: () => void;
  onCancel: () => void;
  /** Singular noun for the delete prompt: "service" gives "Delete service" / "Delete this service?". */
  noun: string;
  addLabel: string;
  /** Hide the delete action (e.g. for a role that can't delete). */
  canDelete?: boolean;
}

/** Sticky-footer buttons: Cancel + Save (add or save changes), and Delete with an inline confirm. */
export function EditSheetFooter({
  isEdit,
  pending,
  confirmDelete,
  onConfirmDelete,
  onDelete,
  onCancel,
  noun,
  addLabel,
  canDelete = true,
}: EditSheetFooterProps) {
  if (confirmDelete) {
    return (
      <>
        <p className="mr-auto text-sm font-medium">Delete this {noun}?</p>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={pending}
          onClick={() => onConfirmDelete(false)}
        >
          Keep {noun}
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="h-10"
          disabled={pending}
          onClick={onDelete}
        >
          {pending ? "Deleting…" : "Confirm delete"}
        </Button>
      </>
    );
  }
  return (
    <>
      {isEdit && canDelete && (
        <Button
          type="button"
          variant="ghost"
          className="mr-auto h-10 text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          disabled={pending}
          onClick={() => onConfirmDelete(true)}
        >
          Delete {noun}
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        className={isEdit && canDelete ? "h-10" : "ml-auto h-10"}
        disabled={pending}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" className="h-10" disabled={pending}>
        {pending ? "Saving…" : isEdit ? "Save changes" : addLabel}
      </Button>
    </>
  );
}

/** Inline error line for the bottom of a sheet body. */
export function SheetError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
      {message}
    </p>
  );
}
