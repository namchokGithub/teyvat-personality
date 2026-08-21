import { Check, Clipboard, Download, Link as LinkIcon, Share2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Button } from "../common";
import { t } from "../../i18n";
import { useDialogAccessibility } from "../../hooks";
import type { CharacterMatch, Locale, VisionMatch } from "../../types";
import { copyText, createSharePayload, downloadShareCard } from "../../utils/share-result";

type Feedback = "idle" | "copiedLink" | "copiedSummary" | "shared" | "downloaded" | "error";

export function ShareResultDialog({ character, vision, locale, onClose }: { character: CharacterMatch; vision: VisionMatch; locale: Locale; onClose: () => void }) {
  const payload = useMemo(() => createSharePayload(character, vision, locale), [character, locale, vision]);
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogAccessibility(dialogRef, onClose);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const nativeShare = (navigator as unknown as { share?: (data: ShareData) => Promise<void> }).share;
  const run = async (action: () => void | Promise<void>, success: Feedback) => {
    try { await action(); setFeedback(success); } catch { setFeedback("error"); }
  };
  const share = () => run(async () => {
    if (nativeShare) { await nativeShare.call(navigator, payload); return; }
    await copyText(payload.url);
  }, nativeShare ? "shared" : "copiedLink");

  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><div ref={dialogRef} className="share-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title" aria-describedby="share-description" tabIndex={-1} onMouseDown={(event) => event.stopPropagation()}><button className="dialog__close" onClick={onClose} aria-label={t(locale, "close")}><X size={18} /></button><div className="share-dialog__heading"><span className="section-kicker">Teyvat Personalities</span><h2 id="share-title">{t(locale, "shareTitle")}</h2><p id="share-description">{t(locale, "shareBody")}</p></div><ShareCardPreview character={character} vision={vision} locale={locale} /><div className="share-actions"><Button onClick={share}><Share2 size={18} aria-hidden="true" />{t(locale, "shareDevice")}</Button><Button variant="secondary" onClick={() => run(() => copyText(payload.url), "copiedLink")}><LinkIcon size={18} aria-hidden="true" />{t(locale, "copyLink")}</Button><Button variant="secondary" onClick={() => run(() => copyText(`${payload.text}\n${payload.url}`), "copiedSummary")}><Clipboard size={18} aria-hidden="true" />{t(locale, "copySummary")}</Button><Button variant="secondary" onClick={() => run(() => downloadShareCard(character, vision, locale), "downloaded")}><Download size={18} aria-hidden="true" />{t(locale, "downloadCard")}</Button></div><div className={`share-feedback ${feedback === "error" ? "share-feedback--error" : ""}`} aria-live="polite">{feedback !== "idle" && <><Check size={15} aria-hidden="true" />{t(locale, feedback)}</>}</div><p className="share-dialog__note">{t(locale, "shareSvgNotice")}</p></div></div>;
}

function ShareCardPreview({ character, vision, locale }: { character: CharacterMatch; vision: VisionMatch; locale: Locale }) {
  return <div className="share-card" aria-label={t(locale, "sharePreview")}><div className="share-card__portrait">{character.artworkUrl ? <img src={character.artworkUrl} alt="" loading="lazy" /> : <span>{character.name.charAt(0)}</span>}</div><div className="share-card__content"><small>Teyvat Personalities</small><h3>{character.name}</h3><p>{character.title[locale]}</p><strong>{character.compatibility}%</strong><span>Character Match</span><div className="share-card__vision"><b>{vision.element} Vision</b><em>{vision.affinity}% Affinity</em></div><div className="share-card__traits">{character.matchingTraits.slice(0, 3).map((trait) => <i key={trait.en}>{trait[locale]}</i>)}</div></div></div>;
}
