import { type RefObject, useEffect } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useDialogAccessibility(ref: RefObject<HTMLElement | null>, onClose: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = ref.current;
    if (!dialog) return;
    const focusable = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)];
    (focusable[0] ?? dialog).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)];
      if (!controls.length) { event.preventDefault(); dialog.focus(); return; }
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("keydown", handleKeyDown); previouslyFocused?.focus(); };
  }, [enabled, onClose, ref]);
}
