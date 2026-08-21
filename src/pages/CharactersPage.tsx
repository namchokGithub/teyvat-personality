import { Search, Sparkles, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Button, PageContainer } from "../components/common";
import { getCharacterArtwork } from "../data/characters/artwork";
import { loadCharacterSummaries } from "../data/characters/repository";
import { t } from "../i18n";
import type { CharacterSummary, Locale } from "../types";

const unique = (values: Array<string | null>) => [...new Set(values.filter((value): value is string => Boolean(value)))].sort();

export function CharactersPage({ locale }: { locale: Locale }) {
  const [characters, setCharacters] = useState<CharacterSummary[] | null>(null);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [element, setElement] = useState("");
  const [rarity, setRarity] = useState("");

  useEffect(() => {
    let active = true;
    loadCharacterSummaries().then((value) => { if (active) setCharacters(value); });
    return () => { active = false; };
  }, []);

  const regions = useMemo(() => unique(characters?.map((item) => item.region) ?? []), [characters]);
  const elements = useMemo(() => unique(characters?.map((item) => item.element) ?? []), [characters]);
  const filtered = useMemo(() => (characters ?? []).filter((character) =>
    character.name.toLowerCase().includes(query.trim().toLowerCase())
    && (!region || character.region === region)
    && (!element || character.element === element)
    && (!rarity || character.rarity === Number(rarity))), [characters, element, query, rarity, region]);
  const clear = () => { setQuery(""); setRegion(""); setElement(""); setRarity(""); };

  return <main className="directory-page"><PageContainer>
    <header className="directory-heading"><span className="eyebrow"><Sparkles size={15} />Character master data</span><h1>{t(locale, "directoryTitle")}</h1><p>{t(locale, "directoryBody")}</p></header>
    <div className="directory-filters">
      <label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t(locale, "searchCharacters")} /></label>
      <select value={region} onChange={(event) => setRegion(event.target.value)} aria-label={t(locale, "allRegions")}><option value="">{t(locale, "allRegions")}</option>{regions.map((value) => <option key={value}>{value}</option>)}</select>
      <select value={element} onChange={(event) => setElement(event.target.value)} aria-label={t(locale, "allElements")}><option value="">{t(locale, "allElements")}</option>{elements.map((value) => <option key={value}>{value}</option>)}</select>
      <select value={rarity} onChange={(event) => setRarity(event.target.value)} aria-label={t(locale, "allRarities")}><option value="">{t(locale, "allRarities")}</option><option value="4">4 {"\u2605"}</option><option value="5">5 {"\u2605"}</option></select>
    </div>
    {characters === null ? <div className="directory-grid" aria-label={t(locale, "loadingCharacter")}>{Array.from({ length: 8 }, (_, index) => <div className="directory-card directory-card--loading" key={index} />)}</div> : <>
      <div className="directory-count">{filtered.length} {t(locale, "charactersFound")}</div>
      {filtered.length ? <div className="directory-grid">{filtered.map((character) => <DirectoryCharacterCard character={character} locale={locale} key={character.id} />)}</div> : <div className="empty-state directory-empty"><h2>{t(locale, "noCharacters")}</h2><Button variant="secondary" onClick={clear}>{t(locale, "clearFilters")}</Button></div>}
    </>}
  </PageContainer></main>;
}

function DirectoryCharacterCard({ character, locale }: { character: CharacterSummary; locale: Locale }) {
  const [imageFailed, setImageFailed] = useState(false);
  const artwork = getCharacterArtwork(character.id, "full");
  return <Link className="directory-card" to={`/characters/${character.id}`}>
    <div className="directory-card__portrait" aria-hidden="true">{artwork && !imageFailed ? <img src={artwork.url} alt="" loading="lazy" decoding="async" onError={() => setImageFailed(true)} /> : character.name.charAt(0)}</div>
    <div className="directory-card__body"><span>{character.region || t(locale, "unavailable")} · {character.element || t(locale, "unavailable")}</span><h2>{character.name}</h2><div className="directory-card__rarity">{character.rarity ? Array.from({ length: character.rarity }, (_, index) => <Star key={index} size={12} fill="currentColor" />) : t(locale, "unavailable")}</div></div>
  </Link>;
}
