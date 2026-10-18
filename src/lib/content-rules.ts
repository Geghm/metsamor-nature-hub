import type { Lang, Localized } from "@/lib/i18n";
import type { SiteSlot } from "@/lib/cms-types";

export function emptyLocalized(): Localized {
  return { hy: "", en: "", ru: "" };
}

export function publishedFeatured<T extends { featured: boolean; status: string }>(rows: T[]): T[] {
  return rows.filter((row) => row.featured && row.status === "published");
}

/** Use the active language only. Never copy another language into an empty field. */
export function textForLanguage(
  value: Localized | null | undefined,
  lang: Lang,
): { text: string; missing: boolean } {
  const text = value?.[lang]?.trim() ?? "";
  if (text) return { text, missing: false };
  return { text: "", missing: true };
}

export function altForLanguage(
  primary: Localized | null | undefined,
  secondary: Localized | null | undefined,
  lang: Lang,
): string {
  const own = primary?.[lang]?.trim() ?? "";
  if (own) return own;
  return secondary?.[lang]?.trim() ?? "";
}

export function resolveSlotImage(
  slot: SiteSlot | null | undefined,
  fallback: string | null,
): { src: string | null; focalX: number; focalY: number } {
  return {
    src: slot?.media?.url || fallback,
    focalX: slot?.focalX ?? 50,
    focalY: slot?.focalY ?? 50,
  };
}

export function sortByOrder<T extends { sortOrder: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function homeTreasures<T extends { featured: boolean; status: string; sortOrder: number }>(
  rows: T[],
  source: "local" | "database",
): T[] {
  const ordered = sortByOrder(rows);
  if (source === "local") return ordered;
  return publishedFeatured(ordered);
}
