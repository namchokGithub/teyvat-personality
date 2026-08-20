import { Check } from "lucide-react";

import type { LocalizedText, Locale } from "../../types";

export function QuizProgress({ current, total }: { current: number; total: number }) {
  const progress = Math.round((current / total) * 100);
  return (
    <div className="quiz-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current} aria-valuetext={`${current} / ${total}`}>
      <div className="quiz-progress__meta"><span>{progress}%</span><span>{current}/{total}</span></div>
      <div className="quiz-progress__track"><span style={{ width: `${progress}%` }} /></div>
    </div>
  );
}

export function AnswerOption({ label, locale, selected, onSelect }: {
  label: LocalizedText;
  locale: Locale;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" role="radio" aria-checked={selected} className={`answer-option ${selected ? "answer-option--selected" : ""}`} onClick={onSelect}>
      <span className="answer-option__indicator" aria-hidden="true">{selected && <Check size={16} />}</span>
      <span>{label[locale]}</span>
    </button>
  );
}
