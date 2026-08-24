import { ChevronDown } from "lucide-react";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { useDialogAccessibility } from "../../hooks";
import { ElementIcon } from "../common";
import {
  VISION_ELEMENTS,
  visionElementLabels,
  type VisionElement,
} from "./visionEffects.config";

const PANEL_MARGIN = 12;
const PANEL_WIDTH = 300;

function computePanelPosition(trigger: HTMLElement, panelHeight: number) {
  const rect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(PANEL_WIDTH, viewportWidth - PANEL_MARGIN * 2);

  let left = rect.right - width;
  left = Math.max(
    PANEL_MARGIN,
    Math.min(left, viewportWidth - width - PANEL_MARGIN),
  );

  const spaceBelow = viewportHeight - rect.bottom - PANEL_MARGIN;
  const spaceAbove = rect.top - PANEL_MARGIN;
  const openUpward = spaceBelow < panelHeight && spaceAbove > spaceBelow;
  const top = openUpward
    ? Math.max(PANEL_MARGIN, rect.top - panelHeight - PANEL_MARGIN)
    : Math.min(
        viewportHeight - panelHeight - PANEL_MARGIN,
        rect.bottom + PANEL_MARGIN,
      );

  return { left, top, width };
}

export function VisionEffectSwitcher({
  effect,
  onChange,
}: {
  effect: VisionElement;
  onChange: (effect: VisionElement) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({
    left: 0,
    top: -9999,
    width: PANEL_WIDTH,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  useDialogAccessibility(panelRef, close, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const selected = panelRef.current?.querySelector<HTMLButtonElement>(
      `[data-vision-effect="${effect}"]`,
    );
    selected?.focus();
  }, [isOpen, effect]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const reposition = () => {
      setPosition(computePanelPosition(trigger, panel.offsetHeight));
    };
    reposition();
    window.addEventListener("resize", reposition);
    return () => window.removeEventListener("resize", reposition);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, close]);

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (
      ![
        "ArrowRight",
        "ArrowDown",
        "ArrowLeft",
        "ArrowUp",
        "Home",
        "End",
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? VISION_ELEMENTS.length - 1
          : (index +
              (event.key === "ArrowRight" || event.key === "ArrowDown"
                ? 1
                : -1) +
              VISION_ELEMENTS.length) %
            VISION_ELEMENTS.length;
    const nextElement = VISION_ELEMENTS[nextIndex];
    onChange(nextElement);
    document
      .querySelector<HTMLButtonElement>(`[data-vision-effect="${nextElement}"]`)
      ?.focus();
  };

  const selectElement = (element: VisionElement) => {
    onChange(element);
    close();
    triggerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`vision-effect-picker__trigger vision-effect-picker__trigger--${effect}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Vision particle effect: ${visionElementLabels[effect]}`}
        onClick={() => setIsOpen((value) => !value)}
      >
        <ElementIcon element={effect} className="vision-effect-picker__icon" />
        <span>{visionElementLabels[effect]}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="vision-effect-picker__chevron"
        />
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            className="vision-effect-picker__panel"
            role="listbox"
            aria-label="Vision particle effect"
            tabIndex={-1}
            style={{
              left: position.left,
              top: position.top,
              width: position.width,
            }}
          >
            {VISION_ELEMENTS.map((element, index) => (
              <button
                key={element}
                type="button"
                className={`vision-effect-picker__option vision-effect-picker__option--${element}`}
                role="option"
                aria-selected={effect === element}
                aria-label={`Select ${visionElementLabels[element]} particle effect`}
                data-vision-effect={element}
                tabIndex={effect === element ? 0 : -1}
                onClick={() => selectElement(element)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
              >
                <ElementIcon
                  element={element}
                  className="vision-effect-picker__icon"
                />
                <span>{visionElementLabels[element]}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
