import { Flame, Leaf, Snowflake } from "lucide-react";
import type { KeyboardEvent } from "react";

import type { VisionEffect } from "./VisionEffectOverlay";

const options = [
  { effect: "cryo", label: "Cryo", Icon: Snowflake },
  { effect: "dendro", label: "Dendro", Icon: Leaf },
  { effect: "pyro", label: "Pyro", Icon: Flame },
] as const;

export function VisionEffectSwitcher({
  effect,
  onChange,
}: {
  effect: VisionEffect;
  onChange: (effect: VisionEffect) => void;
}) {
  const handleKeyDown = (
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
          ? options.length - 1
          : (index +
              (event.key === "ArrowRight" || event.key === "ArrowDown"
                ? 1
                : -1) +
              options.length) %
            options.length;
    const nextEffect = options[nextIndex].effect;
    onChange(nextEffect);
    document
      .querySelector<HTMLButtonElement>(`[data-vision-effect="${nextEffect}"]`)
      ?.focus();
  };

  return (
    <div
      className="vision-effect-switcher"
      role="radiogroup"
      aria-label="Vision particle effect"
    >
      {options.map(({ effect: optionEffect, label, Icon }, index) => (
        <button
          key={optionEffect}
          type="button"
          className={`vision-effect-switcher__button vision-effect-switcher__button--${optionEffect}`}
          role="radio"
          aria-checked={effect === optionEffect}
          aria-label={`Select ${label} particle effect`}
          title={label}
          data-vision-effect={optionEffect}
          tabIndex={effect === optionEffect ? 0 : -1}
          onClick={() => onChange(optionEffect)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
