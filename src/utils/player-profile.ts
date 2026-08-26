import { safeGetItem, safeSetItem } from "../lib/safe-storage";

const PLAYER_NAME_KEY = "teyvat-player-name-v1";

export function readPlayerName() {
  return safeGetItem(PLAYER_NAME_KEY)?.trim() ?? "";
}

export function savePlayerName(name: string) {
  safeSetItem(PLAYER_NAME_KEY, name.trim().slice(0, 40));
}
