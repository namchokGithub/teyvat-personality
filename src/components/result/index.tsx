import { Leaf } from "lucide-react";

import { ElementBadge } from "../common";
import type { CharacterMatch, Locale, VisionMatch } from "../../types";

export function CharacterResultCard({ character, locale }: { character: CharacterMatch; locale: Locale }) {
  return (
    <article className="result-card">
      <div className="result-portrait" aria-hidden="true">
        {character.artworkUrl && <img src={character.artworkUrl} alt="" loading="lazy" />}
        {!character.artworkUrl && <><span className="result-portrait__halo" /><Leaf size={72} strokeWidth={1.1} /><span className="result-portrait__initial">N</span></>}
      </div>
      <div className="result-card__content">
        <div className="result-card__badges"><ElementBadge element={character.element} /><span className="region-badge">{character.region}</span></div>
        <h1>{character.name}</h1>
        <p className="result-title">{character.title[locale]}</p>
        <div className="compatibility"><strong>{character.compatibility}%</strong><span>Compatibility</span></div>
        <p className="result-summary">{character.summary[locale]}</p>
      </div>
    </article>
  );
}

export function VisionCard({ vision, locale, title }: { vision: VisionMatch; locale: Locale; title: string }) {
  return (
    <article className="vision-card">
      <div className="vision-card__icon"><Leaf size={24} /></div>
      <div><span className="section-kicker">{title}</span><h2>{vision.element}</h2><p>{vision.summary[locale]}</p></div>
      <strong>{vision.affinity}%</strong>
    </article>
  );
}
