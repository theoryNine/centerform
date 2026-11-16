"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during server rendering and hydration, true afterwards. Use it to render anything that
 * depends on the viewer's clock or time zone only in the browser, so it can't mismatch the HTML. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
