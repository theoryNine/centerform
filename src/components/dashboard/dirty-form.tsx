"use client";

import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { Label } from "@/components/ui/label";
import { SaveBar } from "@/components/dashboard/save-bar";
import { changedFields, snapshotForm, type FormSnapshot } from "@/lib/form-dirty";

// --- Registry: lets a tab container know how many unsaved changes each form has -------------

interface DirtyRegistry {
  report: (key: string, count: number) => void;
}
export const DirtyRegistryContext = createContext<DirtyRegistry | null>(null);

// --- Per-form state, readable by fields and the live preview ---------------------------------

interface DirtyFormState {
  /** Current value of every named field, kept up to date as the user types. */
  values: FormSnapshot;
  /** Names of fields that differ from the last saved state. */
  changed: ReadonlySet<string>;
}
const DirtyFormContext = createContext<DirtyFormState>({ values: {}, changed: new Set() });
export const useDirtyForm = () => useContext(DirtyFormContext);

/** A <Label> that shows an "edited" marker while its field has unsaved changes. */
export function FieldLabel({
  name,
  children,
  ...props
}: React.ComponentProps<typeof Label> & { name: string }) {
  const { changed } = useDirtyForm();
  return (
    <Label {...props}>
      {children}
      {changed.has(name) && (
        <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-amber-700 dark:text-amber-400">
          <span aria-hidden className="size-1.5 rounded-full bg-amber-500" />
          edited
        </span>
      )}
    </Label>
  );
}

// --- The form --------------------------------------------------------------------------------

interface DirtyFormProps {
  /** Registry key (e.g. the tab name). */
  formKey: string;
  /** Server action to run with the form data. Throw to report a failure. */
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
}

/**
 * Wraps one settings form with dirty tracking, a sticky save bar, Discard (remounts the children
 * so every field, including uploads and color pickers, returns to its saved value), and an inline
 * error when the server action throws.
 */
export function DirtyForm({ formKey, action, children }: DirtyFormProps) {
  const registry = useContext(DirtyRegistryContext);
  const formRef = useRef<HTMLFormElement>(null);
  const [baseline, setBaseline] = useState<FormSnapshot | null>(null);
  const [values, setValues] = useState<FormSnapshot>({});
  const [resetKey, setResetKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Take the baseline once the fields have mounted (and again after every Discard).
  useEffect(() => {
    if (!formRef.current) return;
    const snap = snapshotForm(formRef.current);
    setBaseline(snap);
    setValues(snap);
  }, [resetKey]);

  const changedList = baseline ? changedFields(baseline, values) : [];
  const changed = new Set(changedList);
  const count = changedList.length;

  useEffect(() => {
    registry?.report(formKey, count);
  }, [registry, formKey, count]);
  useEffect(() => () => registry?.report(formKey, 0), [registry, formKey]);

  function sync() {
    if (formRef.current) setValues(snapshotForm(formRef.current));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Pressing Enter in a field submits even when the Save button is disabled.
    if (pending || count === 0) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    setError(null);
    startTransition(async () => {
      try {
        await action(data);
        const snap = snapshotForm(form);
        setBaseline(snap);
        setValues(snap);
      } catch (err) {
        // Production masks server-action error text, so keep a useful generic fallback.
        const detail = err instanceof Error && err.message ? ` ${err.message}` : "";
        setError(
          process.env.NODE_ENV === "production"
            ? "Couldn't save. Check the fields and try again."
            : `Couldn't save.${detail}`,
        );
      }
    });
  }

  function handleDiscard() {
    setError(null);
    setResetKey((k) => k + 1);
  }

  return (
    <DirtyFormContext.Provider value={{ values, changed }}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onInput={sync}
        onChange={sync}
        className="flex flex-col"
      >
        <Fragment key={resetKey}>{children}</Fragment>
        <SaveBar count={count} pending={pending} error={error} onDiscard={handleDiscard} />
      </form>
    </DirtyFormContext.Provider>
  );
}
