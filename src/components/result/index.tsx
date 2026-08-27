import { Leaf } from "lucide-react";
import { useState } from "react";

import { ElementBadge, ElementIcon, RegionBadge } from "../common";
import { getCharacterArtworkFramingStyle } from "../../data/characters/artwork";
import type { CharacterMatch, Locale, VisionMatch } from "../../types";

export function CharacterResultCard({
  character,
  locale,
}: {
  character: CharacterMatch;
  locale: Locale;
}) {
  const [trackedArtworkUrl, setTrackedArtworkUrl] = useState(
    character.artworkUrl,
  );
  const [imageStatus, setImageStatus] = useState<
    "loading" | "loaded" | "error"
  >("loading");
  if (character.artworkUrl !== trackedArtworkUrl) {
    setTrackedArtworkUrl(character.artworkUrl);
    setImageStatus("loading");
  }
  const showArtwork = Boolean(character.artworkUrl) && imageStatus !== "error";
  const showFallback = imageStatus !== "loaded";
  const hasLongName = character.name.replaceAll(" ", "").length >= 10;
  return (
    <article
      className={`result-card result-card--${character.element.toLowerCase()}`}
    >
      <div
        className="result-portrait"
        aria-hidden="true"
        style={getCharacterArtworkFramingStyle(character.characterId)}
      >
        {showArtwork && (
          <img
            className={imageStatus === "loaded" ? "is-loaded" : undefined}
            src={character.artworkUrl}
            alt=""
            loading="eager"
            decoding="async"
            onLoad={() => setImageStatus("loaded")}
            onError={() => setImageStatus("error")}
          />
        )}
        {showFallback && (
          <>
            <span className="result-portrait__halo" />
            <Leaf size={72} strokeWidth={1.1} />
            <span className="result-portrait__initial">
              {character.name.charAt(0)}
            </span>
          </>
        )}
      </div>
      <div className="result-card__content">
        <div className="result-card__badges">
          <ElementBadge element={character.element} />
          <RegionBadge region={character.region} />
        </div>
        <h1 className={hasLongName ? "result-card__name--long" : undefined}>
          {character.name}
        </h1>
        <p className="result-title">{character.title[locale]}</p>
        <div className="compatibility">
          <strong>{character.compatibility}%</strong>
          <span>Compatibility</span>
        </div>
        <p className="result-summary">{character.summary[locale]}</p>
      </div>
    </article>
  );
}

export function VisionCard({
  vision,
  locale,
  title,
}: {
  vision: VisionMatch;
  locale: Locale;
  title: string;
}) {
  return (
    <article
      className={`vision-card vision-card--${vision.element.toLowerCase()}`}
    >
      <div className="vision-card__icon">
        <ElementIcon
          element={vision.element}
          alt={`${vision.element} element symbol`}
        />
      </div>
      <div>
        <span className="section-kicker">{title}</span>
        <h2 className="vision-card__element">{vision.element}</h2>
        <p>{vision.summary[locale]}</p>
      </div>
      <strong>{vision.affinity}%</strong>
    </article>
  );
}

export function AdditionalCharacterCards({
  characters,
  locale,
}: {
  characters: CharacterMatch[];
  locale: Locale;
}) {
  return (
    <div className="additional-character-cards">
      {characters.slice(0, 3).map((character, index) => (
        <AdditionalCharacterCard
          key={character.characterId}
          character={character}
          rank={index + 1}
          locale={locale}
        />
      ))}
    </div>
  );
}

function AdditionalCharacterCard({
  character,
  rank,
  locale,
}: {
  character: CharacterMatch;
  rank: number;
  locale: Locale;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showArtwork = Boolean(character.artworkUrl) && !imageFailed;
  return (
    <article className="additional-character-card">
      <span className="additional-character-card__rank">0{rank}</span>
      {showArtwork && (
        <img
          src={character.artworkUrl}
          alt=""
          loading="lazy"
          style={getCharacterArtworkFramingStyle(character.characterId)}
          onError={() => setImageFailed(true)}
        />
      )}
      <div>
        <ElementBadge element={character.element} />
        <h3>{character.name}</h3>
        <p>{character.title[locale]}</p>
        <div className="additional-character-card__traits">
          {character.matchingTraits.slice(0, 2).map((trait) => (
            <span key={trait.en}>{trait[locale]}</span>
          ))}
        </div>
      </div>
      <strong>{character.compatibility}%</strong>
    </article>
  );
}
