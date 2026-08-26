import { ArrowLeft, ExternalLink, Eye, Sparkles, Star, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  BackToTopButton,
  ElementBadge,
  PageContainer,
  RegionBadge,
} from "../components/common";
import { CharacterResultCard, VisionCard } from "../components/result";
import {
  getCharacterArtwork,
  getCharacterArtworkFramingStyle,
} from "../data/characters/artwork";
import { loadCharacterById } from "../data/characters/repository";
import { useDialogAccessibility } from "../hooks";
import { t } from "../i18n";
import type { CharacterDetail, Locale } from "../types";
import { createCharacterResultPreview } from "../utils/character-preview";

const show = (value: string | null, fallback: string) => value || fallback;
const genshinWikiUrl = (name: string) =>
  `https://genshin-impact.fandom.com/wiki/${encodeURIComponent(name.trim().replaceAll(" ", "_"))}`;

export function CharacterPage({ locale }: { locale: Locale }) {
  const { slug } = useParams();
  const [loaded, setLoaded] = useState<{
    slug: string | undefined;
    value: CharacterDetail | null;
  }>({ slug: undefined, value: null });
  const [showPreview, setShowPreview] = useState(false);
  const previewDialogRef = useRef<HTMLDivElement>(null);
  const closePreview = useCallback(() => setShowPreview(false), []);
  useDialogAccessibility(previewDialogRef, closePreview, showPreview);
  useEffect(() => {
    let active = true;
    loadCharacterById(slug)
      .then((value) => {
        if (active) setLoaded({ slug, value });
      })
      .catch(() => {
        if (active) setLoaded({ slug, value: null });
      });
    return () => {
      active = false;
    };
  }, [slug]);
  if (loaded.slug !== slug)
    return (
      <main className="character-page">
        <PageContainer className="character-shell">
          <div
            className="character-skeleton"
            aria-label={t(locale, "loadingCharacter")}
          >
            <span />
            <span />
            <span />
          </div>
        </PageContainer>
      </main>
    );
  const character = loaded.value;
  if (character === null)
    return (
      <main className="character-page">
        <PageContainer className="character-shell">
          <div className="empty-state">
            <span className="empty-state__icon">?</span>
            <h1>{t(locale, "unknownCharacter")}</h1>
            <p>{t(locale, "unknownCharacterBody")}</p>
            <Link className="button button--primary" to="/characters">
              {t(locale, "browseCharacters")}
            </Link>
          </div>
        </PageContainer>
      </main>
    );

  const title = character.title[locale] || t(locale, "unavailable");
  const description = character.description[locale] || t(locale, "unavailable");
  const initial = character.name.trim().charAt(0).toUpperCase();
  const elementClass = (character.element ?? "unknown").toLowerCase();
  const preview = createCharacterResultPreview(character);
  return (
    <main className="character-page">
      <PageContainer className="character-shell">
        <Link className="back-link" to="/characters">
          <ArrowLeft size={17} />
          {t(locale, "back")}
        </Link>
        <article
          className={`character-profile character-profile--${elementClass}`}
        >
          <CharacterArtwork characterId={character.id} initial={initial} />
          <div className="character-profile__content">
            <div className="character-profile__badges">
              <RegionBadge
                region={show(character.region, t(locale, "unavailable"))}
              />
              {character.element ? (
                <ElementBadge element={character.element} />
              ) : (
                <span className="element-badge">
                  {t(locale, "unavailable")}
                </span>
              )}
            </div>
            <h1>{character.name}</h1>
            <p className="result-title">{title}</p>
            <div className="character-facts">
              <span>{show(character.weapon, t(locale, "unavailable"))}</span>
              <span>
                {character.rarity
                  ? Array.from({ length: character.rarity }, (_, index) => (
                      <Star key={index} size={14} fill="currentColor" />
                    ))
                  : t(locale, "unavailable")}
              </span>
            </div>
            <h2>{t(locale, "characterAbout")}</h2>
            <p>{description}</p>
            <div className="data-notice">{t(locale, "factualNotice")}</div>
            <div className="character-profile__actions">
              <a
                className="button button--secondary"
                href={genshinWikiUrl(character.name)}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={18} />
                {t(locale, "openWiki")}
              </a>
              {preview && (
                <button
                  className="button button--primary"
                  type="button"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye size={18} />
                  {t(locale, "preview")}
                </button>
              )}
            </div>
          </div>
        </article>
      </PageContainer>
      <BackToTopButton locale={locale} />
      {showPreview && preview && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={closePreview}
        >
          <div
            ref={previewDialogRef}
            className="dialog character-preview-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-preview-title"
            tabIndex={-1}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="dialog__close"
              type="button"
              onClick={closePreview}
              aria-label={t(locale, "close")}
            >
              <X size={18} aria-hidden="true" />
            </button>
            <h2 id="character-preview-title">{t(locale, "preview")}</h2>
            <CharacterResultCard
              character={preview.character}
              locale={locale}
            />
            <div className="character-preview-dialog__vision">
              <VisionCard
                vision={preview.vision}
                locale={locale}
                title={t(locale, "visionTitle")}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function CharacterArtwork({
  characterId,
  initial,
}: {
  characterId: string;
  initial: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const artwork = getCharacterArtwork(characterId, "full");
  return (
    <div
      className="character-profile__art"
      aria-hidden="true"
      style={getCharacterArtworkFramingStyle(characterId)}
    >
      {artwork && !imageFailed ? (
        <img
          src={artwork.url}
          alt=""
          loading="eager"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <>
          <Sparkles size={42} />
          <span>{initial}</span>
        </>
      )}
    </div>
  );
}
