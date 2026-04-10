export type UILanguage = "english" | "urdu";

export function normalizeLanguage(value: unknown): UILanguage {
  if (typeof value !== "string") return "english";
  return value.toLowerCase() === "urdu" ? "urdu" : "english";
}

export function isUrdu(value: unknown): boolean {
  return normalizeLanguage(value) === "urdu";
}
