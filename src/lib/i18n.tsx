import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const LANGS = ["hy", "en", "ru"] as const;
export type Lang = (typeof LANGS)[number];
export type Localized = Record<Lang, string>;

const UI = {
  brand: { hy: "Մեծամոր", en: "Metsamor", ru: "Мецамор" },
  tagline: { hy: "Գործենք հանուն բնության", en: "Taking Action for Nature", ru: "Действуем ради природы" },
  navHome: { hy: "Գլխավոր", en: "Home", ru: "Главная" },
  navTreasures: { hy: "Բնության գանձեր", en: "Nature treasures", ru: "Сокровища природы" },
  navSettlements: { hy: "Բնակավայրեր", en: "Settlements", ru: "Населённые пункты" },
  navAbout: { hy: "Նախագծի մասին", en: "About", ru: "О проекте" },
  heroLead: {
    hy: "Մեծամոր համայնքի բնական ժառանգությունը՝ ԿՕՊ17-ի համատեքստում։",
    en: "The natural heritage of Metsamor Community, in the context of COP17.",
    ru: "Природное наследие общины Мецамор в контексте COP17.",
  },
  explore: { hy: "Բացահայտել գանձերը", en: "Explore the treasures", ru: "Открыть сокровища" },
  skip: { hy: "Բաց թողնել", en: "Skip intro", ru: "Пропустить" },
  draft: { hy: "Սևագիր · չստուգված", en: "Draft · unverified", ru: "Черновик · не проверено" },
  draftNote: {
    hy: "Այս բովանդակությունը օրինակային է և դեռ չի ստուգվել։",
    en: "This content is an example placeholder and has not been verified.",
    ru: "Этот материал — пример-заглушка и ещё не проверен.",
  },
  back: { hy: "← Բոլոր գանձերը", en: "← All treasures", ru: "← Все сокровища" },
  settlementsLead: {
    hy: "Մեծամոր համայնքի ներկայիս բնակավայրերը։ Ցանկը սպասում է պաշտոնական հաստատման։",
    en: "Current settlements of Metsamor Community. The list awaits official confirmation.",
    ru: "Текущие населённые пункты общины Мецамор. Список ожидает официального подтверждения.",
  },
  search: { hy: "Որոնել…", en: "Search…", ru: "Поиск…" },
  noResults: { hy: "Արդյունք չկա", en: "No results", ru: "Нет результатов" },
  type: { hy: "Տեսակ", en: "Type", ru: "Тип" },
  footer: {
    hy: "Կոնտակտային տվյալները կհրապարակվեն հաստատումից հետո։",
    en: "Contact details will be published once confirmed.",
    ru: "Контактные данные будут опубликованы после подтверждения.",
  },
} satisfies Record<string, Localized>;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof UI) => string; l: (v: Localized) => string };
const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("hy");
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && LANGS.includes(saved)) setLangState(saved);
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("lang", l); };
  return (
    <LangContext.Provider value={{ lang, setLang, t: (k) => UI[k][lang], l: (v) => v[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useI18n() {
  const c = useContext(LangContext);
  if (!c) throw new Error("useI18n outside LanguageProvider");
  return c;
}
