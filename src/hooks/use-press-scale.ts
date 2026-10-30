/**
 * Returns event handlers that apply a scale press effect directly to a DOM element.
 * No re-render overhead — handlers mutate the element's inline style directly.
 *
 * Usage:
 *   const pressHandlers = usePressScale();
 *   <button {...pressHandlers} className="transition-transform ...">
 */
export function usePressScale(scale = "0.97") {
  return {
    onMouseDown: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = `scale(${scale})`;
    },
    onMouseUp: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = "scale(1)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = "scale(1)";
    },
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => {
      e.currentTarget.style.transform = `scale(${scale})`;
    },
    onTouchEnd: (e: React.TouchEvent<HTMLElement>) => {
      e.currentTarget.style.transform = "scale(1)";
    },
  };
}
