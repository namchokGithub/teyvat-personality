const modules = import.meta.glob(
  ["./character-personalities/*.json", "!./character-personalities/_*.json"],
  { eager: true, import: "default" },
);

export const rawCharacterPersonalitiesById = new Map(
  Object.entries(modules).map(([path, raw]) => [
    path.replace("./character-personalities/", "").replace(".json", ""),
    raw,
  ]),
);
