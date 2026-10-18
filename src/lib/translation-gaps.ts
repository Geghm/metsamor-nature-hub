import type { AdminWorkspace, Localized } from "@/lib/cms-types";
import { LANGS, type Lang } from "@/lib/i18n";

export interface TranslationGap {
  section: string;
  lang: Lang;
}

function walk(gaps: TranslationGap[], section: string, value: Localized) {
  for (const lang of LANGS) {
    if (!value[lang].trim()) gaps.push({ section, lang });
  }
}

export function translationGaps(workspace: AdminWorkspace): TranslationGap[] {
  const gaps: TranslationGap[] = [];
  const settings: Array<[string, Localized]> = [
    ["homepage:hero-title", workspace.settings.heroTitle],
    ["homepage:hero-subtitle", workspace.settings.heroSubtitle],
    ["homepage:treasures-button", workspace.settings.ctaTreasuresLabel],
    ["homepage:settlements-button", workspace.settings.ctaSettlementsLabel],
    ["homepage:featured-eyebrow", workspace.settings.featuredEyebrow],
    ["homepage:featured-title", workspace.settings.featuredTitle],
    ["homepage:pillar-1-title", workspace.settings.pillar1Title],
    ["homepage:pillar-1-text", workspace.settings.pillar1Body],
    ["homepage:pillar-2-title", workspace.settings.pillar2Title],
    ["homepage:pillar-2-text", workspace.settings.pillar2Body],
    ["homepage:pillar-3-title", workspace.settings.pillar3Title],
    ["homepage:pillar-3-text", workspace.settings.pillar3Body],
    ["homepage:banner-title", workspace.settings.bandTitle],
    ["homepage:banner-text", workspace.settings.bandBody],
    ["homepage:about-title", workspace.settings.aboutTitle],
    ["homepage:about-text", workspace.settings.aboutBody],
    ["homepage:about-note", workspace.settings.aboutNote],
    ["homepage:footer", workspace.settings.footerBody],
    ["homepage:rights", workspace.settings.rightsLine],
    ["homepage:treasures-lead", workspace.settings.treasuresLead],
    ["homepage:settlements-lead", workspace.settings.settlementsLead],
    ["homepage:contact-lead", workspace.settings.contactLead],
  ];
  for (const [section, value] of settings) walk(gaps, section, value);
  for (const slot of Object.values(workspace.slots)) {
    if (slot.media) walk(gaps, `image:${slot.key}`, slot.alt);
  }
  for (const category of workspace.categories) {
    walk(gaps, `category:${category.slug}`, category.name);
  }
  for (const treasure of workspace.treasures) {
    walk(gaps, `treasure:${treasure.slug}:title`, treasure.title);
    walk(gaps, `treasure:${treasure.slug}:summary`, treasure.summary);
    walk(gaps, `treasure:${treasure.slug}:body`, treasure.body);
  }
  for (const settlement of workspace.settlements) {
    walk(gaps, `settlement:${settlement.slug}:name`, settlement.name);
    walk(gaps, `settlement:${settlement.slug}:summary`, settlement.summary);
    walk(gaps, `settlement:${settlement.slug}:body`, settlement.body);
  }
  if (workspace.contactDescription.hy || workspace.contactDescription.en || workspace.contactDescription.ru) {
    walk(gaps, "contact:description", workspace.contactDescription);
  }
  for (const link of workspace.contactLinks) walk(gaps, `contact:${link.kind}`, link.label);
  return gaps;
}
