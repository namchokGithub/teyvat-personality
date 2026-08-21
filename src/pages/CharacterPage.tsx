import { ArrowLeft, MapPin, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { PageContainer } from "../components/common";
import { getCharacterArtwork } from "../data/characters/artwork";
import { loadCharacterById } from "../data/characters/repository";
import { t } from "../i18n";
import type { CharacterDetail, Locale } from "../types";

const show = (value: string | null, fallback: string) => value || fallback;

export function CharacterPage({ locale }: { locale: Locale }) {
  const { slug } = useParams();
  const [loaded, setLoaded] = useState<{ slug: string | undefined; value: CharacterDetail | null }>({ slug: undefined, value: null });
  useEffect(() => {
    let active = true;
    loadCharacterById(slug).then((value) => { if (active) setLoaded({ slug, value }); }).catch(() => { if (active) setLoaded({ slug, value: null }); });
    return () => { active = false; };
  }, [slug]);
  if (loaded.slug !== slug) return <main className="character-page"><PageContainer className="character-shell"><div className="character-skeleton" aria-label={t(locale, "loadingCharacter")}><span /><span /><span /></div></PageContainer></main>;
  const character = loaded.value;
  if (character === null) return <main className="character-page"><PageContainer className="character-shell"><div className="empty-state"><span className="empty-state__icon">?</span><h1>{t(locale, "unknownCharacter")}</h1><p>{t(locale, "unknownCharacterBody")}</p><Link className="button button--primary" to="/characters">{t(locale, "browseCharacters")}</Link></div></PageContainer></main>;

  const title = character.title[locale] || t(locale, "unavailable");
  const description = character.description[locale] || t(locale, "unavailable");
  const initial = character.name.trim().charAt(0).toUpperCase();
  return <main className="character-page"><PageContainer className="character-shell"><Link className="back-link" to="/characters"><ArrowLeft size={17} />{t(locale, "back")}</Link><article className="character-profile"><CharacterArtwork characterId={character.id} initial={initial} /><div className="character-profile__content"><div className="character-profile__badges"><span className="region-badge"><MapPin size={13} aria-hidden="true" />{show(character.region, t(locale, "unavailable"))}</span><span className={`element-badge element-badge--${(character.element ?? "unknown").toLowerCase()}`}><Sparkles size={13} aria-hidden="true" />{show(character.element, t(locale, "unavailable"))}</span></div><h1>{character.name}</h1><p className="result-title">{title}</p><div className="character-facts"><span>{show(character.weapon, t(locale, "unavailable"))}</span><span>{character.rarity ? Array.from({ length: character.rarity }, (_, index) => <Star key={index} size={14} fill="currentColor" />) : t(locale, "unavailable")}</span></div><h2>{t(locale, "characterAbout")}</h2><p>{description}</p><div className="data-notice">{t(locale, "factualNotice")}</div></div></article></PageContainer></main>;
}

function CharacterArtwork({ characterId, initial }: { characterId: string; initial: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const artwork = getCharacterArtwork(characterId, "full");
  return <div className="character-profile__art" aria-hidden="true">{artwork && !imageFailed ? <img src={artwork.url} alt="" loading="eager" decoding="async" onError={() => setImageFailed(true)} /> : <><Sparkles size={42} /><span>{initial}</span></>}</div>;
}
