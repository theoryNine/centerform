import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Tracks whether an image has finished loading (or erroring).
 * Handles cached images that fire `load` before React attaches handlers.
 *
 * @param url - The image src. Pass null/undefined when there is no image;
 *              `loaded` will be true immediately so no spinner is shown.
 */
export function useImageLoaded(url: string | null | undefined) {
  const [loaded, setLoaded] = useState(!url);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  const settle = useCallback(() => setLoaded(true), []);

  return { loaded, imgRef, settle };
}
