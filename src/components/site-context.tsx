import { createContext, useContext, type ReactNode } from "react";
import type { PublicSite, SiteSettings } from "@/lib/cms-types";
import { textForLanguage } from "@/lib/content-rules";
import { useI18n, type UIKey } from "@/lib/i18n";

const SiteContext = createContext<PublicSite | null>(null);

export function SiteProvider({ value, children }: { value: PublicSite; children: ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): PublicSite {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useSite outside SiteProvider");
  return value;
}

type PhraseKey = {
  [K in keyof SiteSettings]: SiteSettings[K] extends { hy: string } ? K : never;
}[keyof SiteSettings];

export function usePhrase(key: PhraseKey, fallback: UIKey): string {
  const { lang, t } = useI18n();
  const site = useSite();
  const value = site.settings?.[key];
  if (!value) return t(fallback);
  const result = textForLanguage(value, lang);
  return result.missing ? t("missingTranslation") : result.text;
}
