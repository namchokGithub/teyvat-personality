import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ContentCard, PageContainer } from "../components/common";
import { CharacterResultCard, VisionCard } from "../components/result";
import { t } from "../i18n";
import { firebaseApp } from "../lib/firebase";
import type { CharacterMatch, Locale, SharedResultDoc, VisionMatch } from "../types";

export function SharedResultPage({ locale }: { locale: Locale }) {
  const { id } = useParams();
  const [loaded, setLoaded] = useState<{
    id: string | undefined;
    value: SharedResultDoc | null;
  }>({ id: undefined, value: null });

  useEffect(() => {
    if (!id) return;
    let active = true;
    const db = getFirestore(firebaseApp);
    getDoc(doc(db, "sharedResults", id))
      .then((snapshot) => {
        if (active) setLoaded({ id, value: snapshot.exists() ? (snapshot.data() as SharedResultDoc) : null });
      })
      .catch(() => {
        if (active) setLoaded({ id, value: null });
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (id && loaded.id !== id)
    return (
      <main className="result-page">
        <PageContainer className="result-shell">
          <div className="character-skeleton" aria-label={t(locale, "loadingSharedResult")}>
            <span />
            <span />
            <span />
          </div>
        </PageContainer>
      </main>
    );

  const sharedDoc = id ? loaded.value : null;
  if (!sharedDoc)
    return (
      <main className="result-page">
        <PageContainer className="result-shell">
          <div className="empty-state">
            <span className="empty-state__icon">!</span>
            <h1>{t(locale, "invalidResult")}</h1>
            <p>{t(locale, "invalidResultBody")}</p>
            <Link className="button button--primary" to="/quiz">
              {t(locale, "start")}
            </Link>
          </div>
        </PageContainer>
      </main>
    );

  const character: CharacterMatch = {
    ...sharedDoc.character,
    artworkUrl: sharedDoc.character.artworkUrl ?? undefined,
  };
  const vision: VisionMatch = sharedDoc.vision;

  return (
    <main className="result-page">
      <PageContainer className="result-shell">
        <CharacterResultCard character={character} locale={locale} />
        <div className="result-details">
          {character.matchingTraits.length > 0 && (
            <ContentCard>
              <span className="section-kicker">{t(locale, "sharedTraits")}</span>
              <div className="trait-list">
                {character.matchingTraits.map((trait) => (
                  <span key={trait.en}>{trait[locale]}</span>
                ))}
              </div>
            </ContentCard>
          )}
          <VisionCard vision={vision} locale={locale} title={t(locale, "visionTitle")} />
        </div>
      </PageContainer>
    </main>
  );
}
