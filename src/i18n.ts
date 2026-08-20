import { en } from "./locales/en";
import { th } from "./locales/th";
import type { Locale } from "./types";

const messages = { th, en };
export type MessageKey = keyof typeof th;
export const t = (locale: Locale, key: MessageKey) => messages[locale][key];
