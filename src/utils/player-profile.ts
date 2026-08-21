const PLAYER_NAME_KEY = "teyvat-player-name-v1";

export function readPlayerName() {
  return localStorage.getItem(PLAYER_NAME_KEY)?.trim() ?? "";
}

export function savePlayerName(name: string) {
  localStorage.setItem(PLAYER_NAME_KEY, name.trim().slice(0, 40));
}
