import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const LANGS = ["hy", "en", "ru"] as const;
export type Lang = (typeof LANGS)[number];
export type Localized = Record<Lang, string>;

export const UI = {
  brand: { hy: "Մեծամոր", en: "Metsamor", ru: "Мецамор" },
  tagline: { hy: "Գործենք հանուն բնության", en: "Taking Action for Nature", ru: "Действуем ради природы" },
  langLabel: { hy: "Լեզու", en: "Language", ru: "Язык" },
  menu: { hy: "Ընտրացանկ", en: "Menu", ru: "Меню" },
  navHome: { hy: "Գլխավոր", en: "Home", ru: "Главная" },
  navTreasures: { hy: "Գանձեր", en: "Treasures", ru: "Сокровища" },
  navSettlements: { hy: "Բնակավայրեր", en: "Settlements", ru: "Населённые пункты" },
  navAbout: { hy: "Նախագծի մասին", en: "About", ru: "О проекте" },
  navContact: { hy: "Կապ", en: "Contact", ru: "Контакты" },
  heroTitle: {
    hy: "Մեծամոր․ բնության հրաշալիքները՝ մեկ պատմության մեջ",
    en: "Metsamor: the wonders of nature in one story",
    ru: "Мецамор: чудеса природы в одной истории",
  },
  heroLead: {
    hy: "Բացահայտի՛ր Մեծամոր համայնքի բնական և մշակութային արժեքները, ծանոթացի՛ր նրա բնակավայրերին և տես, թե ինչպես կարող ենք միասին հոգ տանել մեր շրջակա միջավայրի մասին",
    en: "Discover the natural and cultural values of Metsamor Community, get to know its settlements, and see how together we can care for our environment",
    ru: "Откройте природные и культурные ценности общины Мецамор, познакомьтесь с её населёнными пунктами и узнайте, как вместе мы можем заботиться об окружающей среде",
  },
  ctaTreasures: { hy: "Բացահայտել գանձերը", en: "Explore the treasures", ru: "Открыть сокровища" },
  ctaSettlements: { hy: "Ծանոթանալ բնակավայրերին", en: "Meet the settlements", ru: "Населённые пункты" },
  featuredEyebrow: { hy: "Բնության գանձեր", en: "Nature treasures", ru: "Сокровища природы" },
  featuredTitle: { hy: "Պատմություններ, որոնք արժե պահպանել", en: "Stories worth protecting", ru: "Истории, которые стоит сберечь" },
  seeAll: { hy: "Տեսնել բոլորը", en: "See all", ru: "Смотреть все" },
  readMore: { hy: "Կարդալ ավելին", en: "Read more", ru: "Подробнее" },
  pillarsTitle: { hy: "Ինչ կգտնես այստեղ", en: "What you’ll find here", ru: "Что вы найдёте здесь" },
  pillar1: { hy: "Բնական արժեքներ", en: "Natural values", ru: "Природные ценности" },
  pillar1d: { hy: "Կենսաբազմազանություն, բնապատկերներ և Որդան կարմիր։", en: "Biodiversity, landscapes and Vordan Karmir.", ru: "Биоразнообразие, пейзажи и вордан кармир." },
  pillar2: { hy: "Մշակութային ժառանգություն", en: "Cultural heritage", ru: "Культурное наследие" },
  pillar2d: { hy: "Ավանդույթներ, որոնք կապում են մարդուն և բնությանը։", en: "Traditions that connect people and nature.", ru: "Традиции, связывающие человека и природу." },
  pillar3: { hy: "Միասին գործել", en: "Acting together", ru: "Действовать вместе" },
  pillar3d: { hy: "Իրազեկում և համայնքային նախաձեռնություններ։", en: "Awareness and community initiatives.", ru: "Просвещение и инициативы общины." },
  bandTitle: { hy: "Ծանոթացի՛ր համայնքի բնակավայրերին", en: "Get to know the community’s settlements", ru: "Познакомьтесь с населёнными пунктами общины" },
  skip: { hy: "Բաց թողնել", en: "Skip intro", ru: "Пропустить" },
  draft: { hy: "Սևագիր · չստուգված", en: "Draft · unverified", ru: "Черновик · не проверено" },
  draftNote: {
    hy: "Այս բովանդակությունը օրինակային է և դեռ չի ստուգվել։ Լուսանկարները պատկերազարդ են և չեն ներկայացնում կոնկրետ վայրեր։",
    en: "This content is an example placeholder and has not been verified. Photos are illustrative and do not depict specific places.",
    ru: "Этот материал — пример-заглушка и ещё не проверен. Фотографии иллюстративные и не изображают конкретные места.",
  },
  back: { hy: "← Բոլոր գանձերը", en: "← All treasures", ru: "← Все сокровища" },
  treasuresLead: {
    hy: "Թեմաներ, որոնք ներկայացնում են Մեծամոր համայնքի բնական և մշակութային արժեքները։",
    en: "Topics presenting the natural and cultural values of Metsamor Community.",
    ru: "Темы, представляющие природные и культурные ценности общины Мецамор.",
  },
  settlementsLead: {
    hy: "Այստեղ կներկայացվեն միայն Մեծամոր համայնքի ներկայիս բնակավայրերը։",
    en: "Only the current settlements of Metsamor Community will be listed here.",
    ru: "Здесь будут представлены только текущие населённые пункты общины Мецамор.",
  },
  settlementsPending: {
    hy: "Բնակավայրերի պաշտոնական ցանկը դեռ հաստատված չէ։ Ցանկը կհրապարակվի ստուգումից հետո։",
    en: "The official list of settlements has not been confirmed yet. It will be published after verification.",
    ru: "Официальный список населённых пунктов ещё не подтверждён. Он будет опубликован после проверки.",
  },
  placeholder: { hy: "Տեղապահ", en: "Placeholder", ru: "Заглушка" },
  search: { hy: "Որոնել բնակավայր…", en: "Search settlements…", ru: "Поиск…" },
  noResults: { hy: "Արդյունք չկա", en: "No results", ru: "Нет результатов" },
  type: { hy: "Տեսակ", en: "Type", ru: "Тип" },
  town: { hy: "Քաղաք", en: "Town", ru: "Город" },
  village: { hy: "Գյուղ", en: "Village", ru: "Село" },
  aboutText: {
    hy: "«Մեծամոր — Գործենք հանուն բնության» նախաձեռնությունը ներկայացնում է համայնքի բնական և մշակութային ժառանգությունը ԿՕՊ17-ի համատեքստում։ Բովանդակությունը աստիճանաբար կլրացվի ստուգված տվյալներով։",
    en: "“Metsamor — Taking Action for Nature” presents the community’s natural and cultural heritage in the context of COP17. Content will be added progressively as it is verified.",
    ru: "«Мецамор — Действуем ради природы» представляет природное и культурное наследие общины в контексте COP17. Материалы будут добавляться по мере проверки.",
  },
  aboutNote: {
    hy: "Կայքը չի հանդիսանում ԿՕՊ17-ի պաշտոնական ռեսուրս։ Թիթեռի մոտիվները դեկորատիվ են և պաշտոնական լոգո չեն։",
    en: "This site is not an official COP17 resource. Butterfly motifs are decorative and are not the official logo.",
    ru: "Сайт не является официальным ресурсом COP17. Мотивы бабочки декоративны и не являются официальным логотипом.",
  },
  contactLead: {
    hy: "Կոնտակտային տվյալները կհրապարակվեն պաշտոնական հաստատումից հետո։",
    en: "Contact details will be published once officially confirmed.",
    ru: "Контактные данные будут опубликованы после официального подтверждения.",
  },
  contactPending: { hy: "Սպասվում է հաստատում", en: "Awaiting confirmation", ru: "Ожидает подтверждения" },
  footer: {
    hy: "Կոնտակտային տվյալները կհրապարակվեն հաստատումից հետո։",
    en: "Contact details will be published once confirmed.",
    ru: "Контактные данные будут опубликованы после подтверждения.",
  },
  rights: { hy: "Բովանդակությունը նախնական է։", en: "Content is preliminary.", ru: "Материалы предварительные." },
  notFound: { hy: "Էջը չի գտնվել", en: "Page not found", ru: "Страница не найдена" },
} satisfies Record<string, Localized>;

export type UIKey = keyof typeof UI;
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: UIKey) => string; l: (v: Localized) => string };
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
