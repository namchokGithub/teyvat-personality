import { Leaf } from "lucide-react";
import { useState } from "react";

import { ElementBadge, RegionBadge } from "../common";
import type { CharacterMatch, Locale, VisionMatch } from "../../types";

export function CharacterResultCard({ character, locale }: { character: CharacterMatch; locale: Locale }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showArtwork = Boolean(character.artworkUrl && !imageFailed);
  return (
    <article className={`result-card result-card--${character.element.toLowerCase()}`}>
      <div className="result-portrait" aria-hidden="true">
        {showArtwork && <img src={character.artworkUrl} alt="" loading="eager" decoding="async" onError={() => setImageFailed(true)} />}
        {!showArtwork && <><span className="result-portrait__halo" /><Leaf size={72} strokeWidth={1.1} /><span className="result-portrait__initial">{character.name.charAt(0)}</span></>}
      </div>
      <div className="result-card__content">
        <div className="result-card__badges"><ElementBadge element={character.element} /><RegionBadge region={character.region} /></div>
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
    <article className={`vision-card vision-card--${vision.element.toLowerCase()}`}>
      <div className="vision-card__icon"><Leaf size={24} /></div>
      <div><span className="section-kicker">{title}</span><h2>{vision.element}</h2><p>{vision.summary[locale]}</p></div>
      <strong>{vision.affinity}%</strong>
    </article>
  );
}
