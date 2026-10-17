import type { Localized } from "@/lib/i18n";

/** status "draft" = example placeholder, must be shown with a draft label. */
export type ContentStatus = "draft" | "verified";

export interface Treasure {
  slug: string;
  status: ContentStatus;
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

// EXAMPLE CONTENT ONLY — no locations, figures or contacts are claimed.
export const TREASURES: Treasure[] = [
  {
    slug: "wetland-birds",
    status: "draft",
    category: { hy: "Կենդանական աշխարհ", en: "Wildlife", ru: "Животный мир" },
    title: { hy: "Ջրաճահճային թռչուններ", en: "Wetland birds", ru: "Птицы водно-болотных угодий" },
    summary: {
      hy: "Օրինակային քարտ՝ ջրային միջավայրի թռչունների մասին։",
      en: "Example card about birds of wet habitats.",
      ru: "Пример карточки о птицах влажных местообитаний.",
    },
    body: {
      hy: "Սա տեղապահ տեքստ է։ Վերջնական բովանդակությունը կտրամադրվի մասնագետների կողմից ստուգվելուց հետո։",
      en: "This is placeholder text. Final content will be provided after expert verification.",
      ru: "Это текст-заглушка. Окончательный материал появится после проверки специалистами.",
    },
  },
  {
    slug: "riverside-trees",
    status: "draft",
    category: { hy: "Բուսական աշխարհ", en: "Flora", ru: "Растительный мир" },
    title: { hy: "Գետափնյա ծառեր", en: "Riverside trees", ru: "Прибрежные деревья" },
    summary: {
      hy: "Օրինակային քարտ՝ գետափնյա բուսականության մասին։",
      en: "Example card about riparian vegetation.",
      ru: "Пример карточки о прибрежной растительности.",
    },
    body: {
      hy: "Տեղապահ տեքստ։ Տեսակները և նկարագրությունները դեռ չեն հաստատվել։",
      en: "Placeholder text. Species and descriptions are not yet confirmed.",
      ru: "Текст-заглушка. Виды и описания ещё не подтверждены.",
    },
  },
  {
    slug: "spring-wildflowers",
    status: "draft",
    category: { hy: "Բուսական աշխարհ", en: "Flora", ru: "Растительный мир" },
    title: { hy: "Գարնանային վայրի ծաղիկներ", en: "Spring wildflowers", ru: "Весенние полевые цветы" },
    summary: {
      hy: "Օրինակային քարտ՝ սեզոնային ծաղկման մասին։",
      en: "Example card about seasonal blooming.",
      ru: "Пример карточки о сезонном цветении.",
    },
    body: {
      hy: "Տեղապահ տեքստ։ Կլրացվի ստուգված տվյալներով։",
      en: "Placeholder text. To be completed with verified information.",
      ru: "Текст-заглушка. Будет дополнен проверенными данными.",
    },
  },
];

/**
 * Only settlements currently part of Metsamor Community belong here.
 * The full official list has not been supplied yet; add entries only from an official source.
 */
export const SETTLEMENTS: Settlement[] = [
  { id: "metsamor", status: "draft", kind: "town", name: { hy: "Մեծամոր", en: "Metsamor", ru: "Мецамор" } },
];
