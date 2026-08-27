import {
  Check,
  Clipboard,
  Download,
  Link as LinkIcon,
  Share2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useDialogAccessibility } from "../../hooks";
import { getCharacterArtworkFramingStyle } from "../../data/characters/artwork";
import { t } from "../../i18n";
import {
  reportShareFailure,
  type ShareStage,
} from "../../lib/share-error-reporting";
import type { CharacterMatch, Locale, VisionMatch } from "../../types";
import {
  copyText,
  createSharePayload,
  createShareQrCode,
  downloadShareCard,
} from "../../utils/share-result";
import { Button, ElementIcon } from "../common";

type Feedback =
  | "idle"
  | "copiedLink"
  | "copiedSummary"
  | "shared"
  | "downloaded"
  | "shareErrorCopyLink"
  | "shareErrorNativeShare"
  | "shareErrorGenerateCard";

export function ShareResultDialog({
  character,
  vision,
  locale,
  sharedUrl,
  onClose,
}: {
  character: CharacterMatch;
  vision: VisionMatch;
  locale: Locale;
  sharedUrl: string;
  onClose: () => void;
}) {
  const payload = useMemo(
    () => createSharePayload(character, vision, locale, sharedUrl),
    [character, locale, sharedUrl, vision],
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [pendingStage, setPendingStage] = useState<ShareStage | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  useDialogAccessibility(dialogRef, onClose);

  useEffect(() => {
    let active = true;
    void createShareQrCode(sharedUrl)
      .then((value) => {
        if (active) setQrCode(value);
      })
      .catch(() => {
        if (active) setQrCode(null);
      });
    return () => {
      active = false;
    };
  }, [sharedUrl]);

  const nativeShare = (
    navigator as unknown as { share?: (data: ShareData) => Promise<void> }
  ).share;
  const run = async (
    stage: ShareStage,
    action: () => void | Promise<void>,
    success: Feedback,
    errorFeedback: Feedback,
  ) => {
    setPendingStage(stage);
    try {
      await action();
      setFeedback(success);
    } catch (error) {
      reportShareFailure(stage, error);
      setFeedback(errorFeedback);
    } finally {
      setPendingStage(null);
    }
  };
  const share = () =>
    run(
      "native_share",
      async () => {
        if (nativeShare) {
          await nativeShare.call(navigator, payload);
          return;
        }
        await copyText(payload.url);
      },
      nativeShare ? "shared" : "copiedLink",
      "shareErrorNativeShare",
    );

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="share-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        aria-describedby="share-description"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="dialog__close"
          onClick={onClose}
          aria-label={t(locale, "close")}
        >
          <X size={18} />
        </button>
        <div className="share-dialog__heading">
          <span className="section-kicker">Teyvat Personalities</span>
          <h2 id="share-title">{t(locale, "shareTitle")}</h2>
          <p id="share-description">{t(locale, "shareBody")}</p>
        </div>
        <ShareCardPreview
          character={character}
          vision={vision}
          locale={locale}
          qrCode={qrCode}
        />
        <div className="share-actions">
          <Button onClick={share} disabled={pendingStage !== null}>
            <Share2 size={18} aria-hidden="true" />
            {t(locale, "shareDevice")}
          </Button>
          <Button
            variant="secondary"
            disabled={pendingStage !== null}
            onClick={() =>
              run(
                "copy_link",
                () => copyText(payload.url),
                "copiedLink",
                "shareErrorCopyLink",
              )
            }
          >
            <LinkIcon size={18} aria-hidden="true" />
            {t(locale, "copyLink")}
          </Button>
          <Button
            variant="secondary"
            disabled={pendingStage !== null}
            onClick={() =>
              run(
                "copy_link",
                () => copyText(`${payload.text}\n${payload.url}`),
                "copiedSummary",
                "shareErrorCopyLink",
              )
            }
          >
            <Clipboard size={18} aria-hidden="true" />
            {t(locale, "copySummary")}
          </Button>
          <Button
            variant="secondary"
            disabled={pendingStage !== null}
            onClick={() =>
              run(
                "generate_card",
                () => downloadShareCard(character, vision, locale, sharedUrl),
                "downloaded",
                "shareErrorGenerateCard",
              )
            }
          >
            <Download size={18} aria-hidden="true" />
            {t(locale, "downloadCard")}
          </Button>
        </div>
        <div
          className={`share-feedback ${feedback.startsWith("shareError") ? "share-feedback--error" : ""}`}
          aria-live="polite"
        >
          {feedback !== "idle" && (
            <>
              <Check size={15} aria-hidden="true" />
              {t(locale, feedback)}
            </>
          )}
        </div>
        <p className="share-dialog__note">{t(locale, "shareSvgNotice")}</p>
      </div>
    </div>
  );
}

function ShareCardPreview({
  character,
  vision,
  locale,
  qrCode,
}: {
  character: CharacterMatch;
  vision: VisionMatch;
  locale: Locale;
  qrCode: string | null;
}) {
  return (
    <div
      className={`share-card share-card--${vision.element.toLowerCase()}`}
      aria-label={t(locale, "sharePreview")}
    >
      <div
        className="share-card__portrait"
        style={getCharacterArtworkFramingStyle(character.characterId)}
      >
        {character.artworkUrl ? (
          <img src={character.artworkUrl} alt="" loading="lazy" />
        ) : (
          <span>{character.name.charAt(0)}</span>
        )}
      </div>
      <div className="share-card__content">
        <small>Teyvat Personalities</small>
        <h3>{character.name}</h3>
        <p className="share-card__title">{character.title[locale]}</p>
        <strong>{character.compatibility}%</strong>
        <span>Character Match</span>
        <div className="share-card__vision">
          <b>
            <ElementIcon element={vision.element} alt="" />
            {vision.element} Vision
          </b>
          <em>{vision.affinity}% Affinity</em>
        </div>
        <div className="share-card__traits">
          {character.matchingTraits.slice(0, 3).map((trait) => (
            <i key={trait.en}>{trait[locale]}</i>
          ))}
        </div>
        <p className="share-card__narrative">{character.summary[locale]}</p>
      </div>
      {qrCode && (
        <img
          className="share-card__qr"
          src={qrCode}
          alt="QR code for the shared result"
        />
      )}
    </div>
  );
}
