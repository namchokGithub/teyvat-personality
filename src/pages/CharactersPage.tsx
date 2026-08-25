import { Sparkles, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { BackToTopButton, Button, ElementIcon, PageContainer } from "../components/common";
import { getCharacterArtwork } from "../data/characters/artwork";
import { loadCharacterSummaries } from "../data/characters/repository";
import { t } from "../i18n";
import type { CharacterSummary, Locale } from "../types";

const unique = (values: Array<string | null>) =>
  [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ].sort();

export function CharactersPage({ locale }: { locale: Locale }) {
  const [characters, setCharacters] = useState<CharacterSummary[] | null>(null);
  const [query, setQuery] = useState("");
  const [regionsSelected, setRegionsSelected] = useState<string[]>([]);
  const [elementsSelected, setElementsSelected] = useState<string[]>([]);
  const [raritiesSelected, setRaritiesSelected] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let active = true;
    loadCharacterSummaries().then((value) => {
      if (active) setCharacters(value);
    });
    return () => {
      active = false;
    };
  }, []);

  const regions = useMemo(
    () => unique(characters?.map((item) => item.region) ?? []),
    [characters],
  );
  const elements = useMemo(
    () => unique(characters?.map((item) => item.element) ?? []),
    [characters],
  );
  const filtered = useMemo(
    () =>
      (characters ?? []).filter(
        (character) =>
          character.name.toLowerCase().includes(query.trim().toLowerCase()) &&
          (!regionsSelected.length ||
            (character.region !== null &&
              regionsSelected.includes(character.region))) &&
          (!elementsSelected.length ||
            (character.element !== null &&
              elementsSelected.includes(character.element))) &&
          (!raritiesSelected.length ||
            (character.rarity !== null &&
              raritiesSelected.includes(String(character.rarity)))),
      ),
    [characters, elementsSelected, query, raritiesSelected, regionsSelected],
  );
  const clear = () => {
    setQuery("");
    setRegionsSelected([]);
    setElementsSelected([]);
    setRaritiesSelected([]);
  };

  return (
    <main className="directory-page">
      <PageContainer>
        <header className="directory-heading">
          <span className="eyebrow">
            <Sparkles size={15} />
            Character master data
          </span>
          <h1>{t(locale, "directoryTitle")}</h1>
          <p>{t(locale, "directoryBody")}</p>
        </header>
        <div className="directory-filters">
          <label className="search-field">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t(locale, "searchCharacters")}
            />
          </label>
          <button
            className="directory-filters__toggle"
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="character-filter-options"
            onClick={() => setFiltersOpen((isOpen) => !isOpen)}
          >
            {t(locale, filtersOpen ? "hideFilters" : "showFilters")}
          </button>
          {filtersOpen && (
            <div
              className="directory-filter-options"
              id="character-filter-options"
            >
              <FilterGroup
                label={t(locale, "region")}
                allLabel={t(locale, "allRegions")}
                values={regionsSelected}
                options={regions}
                onChange={setRegionsSelected}
              />
              <FilterGroup
                label={t(locale, "element")}
                allLabel={t(locale, "allElements")}
                values={elementsSelected}
                options={elements}
                onChange={setElementsSelected}
              />
              <FilterGroup
                label={t(locale, "rarity")}
                allLabel={t(locale, "allRarities")}
                values={raritiesSelected}
                options={["4 ★", "5 ★"]}
                optionValue={(option) => option.charAt(0)}
                onChange={setRaritiesSelected}
              />
            </div>
          )}
        </div>
        {characters === null ? (
          <div
            className="directory-grid"
            aria-label={t(locale, "loadingCharacter")}
          >
            {Array.from({ length: 8 }, (_, index) => (
              <div
                className="directory-card directory-card--loading"
                key={index}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="directory-count">
              {filtered.length} {t(locale, "charactersFound")}
            </div>
            {filtered.length ? (
              <div className="directory-grid">
                {filtered.map((character) => (
                  <DirectoryCharacterCard
                    character={character}
                    locale={locale}
                    key={character.id}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state directory-empty">
                <h2>{t(locale, "noCharacters")}</h2>
                <Button variant="secondary" onClick={clear}>
                  {t(locale, "clearFilters")}
                </Button>
              </div>
            )}
          </>
        )}
      </PageContainer>
      <BackToTopButton locale={locale} />
    </main>
  );
}

function FilterGroup({
  label,
  allLabel,
  values,
  options,
  optionValue = (option) => option,
  onChange,
}: {
  label: string;
  allLabel: string;
  values: string[];
  options: string[];
  optionValue?: (option: string) => string;
  onChange: (values: string[]) => void;
}) {
  return (
    <section className="directory-filter-group" aria-label={label}>
      <h2>{label}</h2>
      <div className="directory-filter-group__options">
        <button
          type="button"
          className={!values.length ? "is-selected" : undefined}
          aria-pressed={!values.length}
          onClick={() => onChange([])}
        >
          {allLabel}
        </button>
        {options.map((option) => {
          const valueForOption = optionValue(option);
          return (
            <button
              key={option}
              type="button"
              className={
                values.includes(valueForOption) ? "is-selected" : undefined
              }
              aria-pressed={values.includes(valueForOption)}
              onClick={() =>
                onChange(
                  values.includes(valueForOption)
                    ? values.filter((value) => value !== valueForOption)
                    : [...values, valueForOption],
                )
              }
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DirectoryCharacterCard({
  character,
  locale,
}: {
  character: CharacterSummary;
  locale: Locale;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const artwork = getCharacterArtwork(character.id, "full");
  const elementClass = (character.element ?? "unknown").toLowerCase();
  return (
    <Link className="directory-card" to={`/characters/${character.id}`}>
      <div
        className={`directory-card__portrait directory-card__portrait--${elementClass}`}
        aria-hidden="true"
      >
        {character.element && (
          <ElementIcon
            element={character.element}
            className="directory-card__element-watermark"
          />
        )}
        {artwork && !imageFailed ? (
          <img
            src={artwork.url}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          character.name.charAt(0)
        )}
      </div>
      <div className="directory-card__body">
        <span>
          {character.region || t(locale, "unavailable")} ·{" "}
          {character.element || t(locale, "unavailable")}
        </span>
        <h2>{character.name}</h2>
        <div className="directory-card__rarity">
          {character.rarity
            ? Array.from({ length: character.rarity }, (_, index) => (
                <Star key={index} size={12} fill="currentColor" />
              ))
            : t(locale, "unavailable")}
        </div>
      </div>
    </Link>
  );
}
