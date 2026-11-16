"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Hidden inputs whose value is set from React state (image URL, color) change without the browser
 * firing an event, so a parent <DirtyForm> would never notice. This fires a bubbling `input` event
 * on the element whenever `value` changes after the first render.
 */
export function useNotifyForm(ref: RefObject<HTMLInputElement | null>, value: string) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    ref.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [ref, value]);
}
