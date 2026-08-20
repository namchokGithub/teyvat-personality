import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function RouteFocus() {
  const { pathname } = useLocation();
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>("#main-content h1, #main-content main");
      if (!target) return;
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);
  return null;
}
