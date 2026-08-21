import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { t } from "../i18n";
import { useQuizProgress } from "../hooks";
import { calculateQuizResult } from "../data/personality/calculate-result";
import { saveQuizResult } from "../utils/quiz-result";
import type { Locale } from "../types";

export function MatchingPage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const { state } = useQuizProgress();
  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const [result] = await Promise.all([
          calculateQuizResult(state.answers),
          new Promise((resolve) => window.setTimeout(resolve, 900)),
        ]);
        if (!active) return;
        saveQuizResult(result);
        navigate("/result", { replace: true });
      } catch {
        if (active) navigate("/quiz", { replace: true });
      }
    };
    void run();
    return () => { active = false; };
  }, [navigate, state.answers]);
  return <main className="matching-page"><div className="matching-state" role="status"><span className="matching-state__rings"><Sparkles size={36} /></span><h1>{t(locale, "matchingTitle")}</h1><p>{t(locale, "matchingBody")}</p><span className="matching-state__bar" /></div></main>;
}
