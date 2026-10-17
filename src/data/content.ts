import type { Localized } from "@/lib/i18n";

/** "draft" = example placeholder; must always be shown with a draft label. */
export type ContentStatus = "draft" | "verified";
export type ImageKey = "vordan-karmir" | "biodiversity" | "landscapes" | "traditions" | "green" | "awareness";

export interface Treasure {
  slug: string;
  status: ContentStatus;
  image: ImageKey;
  category: Localized;
  title: Localized;
  summary: Localized;
  body: Localized;
}

export interface Settlement {
  id: string;
  status: ContentStatus;
  kind: "town" | "village";
  name: Localized;
}

const PENDING: Localized = {
  hy: "Այս բաժնի վերջնական տեքստը կպատրաստվի ստուգված աղբյուրների և մասնագետների հետ համագործակցությամբ։ Հստակ վայրեր, թվեր կամ պատմական փաստեր այստեղ դեռ չեն ներկայացվում։",
  en: "Final text for this topic will be prepared with verified sources and experts. No exact locations, figures or historical claims are presented here yet.",
  ru: "Окончательный текст по этой теме будет подготовлен по проверенным источникам совместно со специалистами. Точные места, цифры и исторические сведения пока не приводятся.",
};

// EXAMPLE TOPICS ONLY — all drafts until verified.
export const TREASURES: Treasure[] = [
  {
    slug: "vordan-karmir",
    status: "draft",
    image: "vordan-karmir",
    category: { hy: "Բնական ժառանգություն", en: "Natural heritage", ru: "Природное наследие" },
    title: { hy: "Որդան կարմիր", en: "Vordan Karmir", ru: "Вордан кармир" },
    summary: {
      hy: "Հայկական որդան կարմիրը և նրա հետ կապված բնական ու մշակութային պատմությունը։",
      en: "The Armenian cochineal and the natural and cultural story connected to it.",
      ru: "Армянская кошениль и связанная с ней природная и культурная история.",
    },
    body: PENDING,
  },
  {
    slug: "native-species",
    status: "draft",
    image: "biodiversity",
    category: { hy: "Կենսաբազմազանություն", en: "Biodiversity", ru: "Биоразнообразие" },
    title: { hy: "Տեղական տեսակներ", en: "Native species", ru: "Местные виды" },
    summary: {
      hy: "Բույսերի, միջատների և թռչունների բազմազանությունը որպես համայնքի հարստություն։",
      en: "Plants, insects and birds as part of the community’s living wealth.",
      ru: "Растения, насекомые и птицы как живое богатство общины.",
    },
    body: PENDING,
  },
  {
    slug: "landscapes",
    status: "draft",
    image: "landscapes",
    category: { hy: "Բնապատկեր", en: "Landscapes", ru: "Ландшафты" },
    title: { hy: "Դաշտավայրի բնապատկերներ", en: "Valley landscapes", ru: "Пейзажи долины" },
    summary: {
      hy: "Լույս, ջուր և հորիզոն՝ բնապատկերներ, որոնք ձևավորում են տեղի դիմագիծը։",
      en: "Light, water and horizon — the landscapes that shape the place’s character.",
      ru: "Свет, вода и горизонт — пейзажи, формирующие облик места.",
    },
    body: PENDING,
  },
  {
    slug: "traditions",
    status: "draft",
    image: "traditions",
    category: { hy: "Մշակութային ժառանգություն", en: "Cultural heritage", ru: "Культурное наследие" },
    title: { hy: "Ավանդույթներ և արհեստներ", en: "Traditions and crafts", ru: "Традиции и ремёсла" },
    summary: {
      hy: "Մարդու և բնության կապը՝ ավանդույթների ու ձեռարվեստի միջոցով։",
      en: "The bond between people and nature, carried through traditions and crafts.",
      ru: "Связь человека и природы через традиции и ремёсла.",
    },
    body: PENDING,
  },
  {
    slug: "green-spaces",
    status: "draft",
    image: "green",
    category: { hy: "Կանաչ տարածքներ", en: "Green spaces", ru: "Зелёные зоны" },
    title: { hy: "Կանաչ տարածքներ", en: "Green spaces", ru: "Зелёные пространства" },
    summary: {
      hy: "Այգիներ և ծառուղիներ՝ որպես առօրյա կյանքի և առողջ միջավայրի մաս։",
      en: "Parks and tree-lined paths as part of daily life and a healthy environment.",
      ru: "Парки и аллеи как часть повседневной жизни и здоровой среды.",
    },
    body: PENDING,
  },
  {
    slug: "community-action",
    status: "draft",
    image: "awareness",
    category: { hy: "Բնապահպանական իրազեկում", en: "Environmental awareness", ru: "Экологическое просвещение" },
    title: { hy: "Համայնքային նախաձեռնություններ", en: "Community initiatives", ru: "Инициативы общины" },
    summary: {
      hy: "Ինչպես կարող ենք միասին հոգ տանել շրջակա միջավայրի մասին։",
      en: "How we can take care of our environment together.",
      ru: "Как мы можем вместе заботиться об окружающей среде.",
    },
    body: PENDING,
  },
];

/**
 * Only settlements currently part of Metsamor Community may be listed.
 * The official list is not yet verified, so the directory is intentionally empty
 * and the UI shows a labelled placeholder. Add entries only from an official source.
 */
export const SETTLEMENTS: Settlement[] = [];
