import type { ImageKey } from "@/data/content";
import type { Lang, Localized } from "@/lib/i18n";

export type { Lang, Localized };

export type PublicationStatus = "draft" | "published" | "archived";
export type SettlementKind = "town" | "village";
export type ContactKind = "email" | "phone" | "instagram" | "facebook" | "other";
export type SiteSlotKey = "hero" | "hero_secondary" | "about" | "band" | "favicon";

export const SITE_SLOT_KEYS: SiteSlotKey[] = [
  "hero",
  "hero_secondary",
  "about",
  "band",
  "favicon",
];

export interface MediaAsset {
  id: string;
  storagePath: string;
  url: string;
  label: string;
  alt: Localized;
  mimeType: string;
  byteSize: number;
  focalX: number;
  focalY: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSlot {
  key: SiteSlotKey;
  media: MediaAsset | null;
  alt: Localized;
  focalX: number;
  focalY: number;
  updatedAt: string | null;
}

export interface SiteSettings {
  heroTitle: Localized;
  heroSubtitle: Localized;
  ctaTreasuresLabel: Localized;
  ctaSettlementsLabel: Localized;
  ctaTreasuresHref: string;
  ctaSettlementsHref: string;
  featuredEyebrow: Localized;
  featuredTitle: Localized;
  pillar1Title: Localized;
  pillar1Body: Localized;
  pillar2Title: Localized;
  pillar2Body: Localized;
  pillar3Title: Localized;
  pillar3Body: Localized;
  bandTitle: Localized;
  bandBody: Localized;
  aboutTitle: Localized;
  aboutBody: Localized;
  aboutNote: Localized;
  footerBody: Localized;
  rightsLine: Localized;
  treasuresLead: Localized;
  settlementsLead: Localized;
  contactLead: Localized;
  updatedAt: string | null;
}

export interface PublicTreasure {
  id: string;
  slug: string;
  status: PublicationStatus;
  featured: boolean;
  sortOrder: number;
  categoryId: string;
  categorySlug: string;
  category: Localized;
  title: Localized;
  summary: Localized;
  body: Localized;
  alt: Localized;
  sourceUrl: string | null;
  coverUrl: string | null;
  fallbackImage: ImageKey | null;
  focalX: number;
  focalY: number;
  gallery: GalleryImage[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface GalleryImage {
  id: string;
  mediaId: string;
  url: string;
  alt: Localized;
  focalX: number;
  focalY: number;
  sortOrder: number;
}

export interface PublicSettlement {
  id: string;
  slug: string;
  kind: SettlementKind;
  status: PublicationStatus;
  name: Localized;
  summary: Localized;
  body: Localized;
  alt: Localized;
  coverMediaId: string | null;
  coverUrl: string | null;
  focalX: number;
  focalY: number;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface TreasureCategory {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  sortOrder: number;
  updatedAt: string | null;
}

export interface ContactLink {
  id: string;
  kind: ContactKind;
  label: Localized;
  value: string;
  sortOrder: number;
  updatedAt: string | null;
}

export interface PublicSite {
  source: "local" | "database";
  error: string | null;
  settings: SiteSettings | null;
  slots: Record<SiteSlotKey, SiteSlot>;
  contactDescription: Localized | null;
  contactLinks: ContactLink[];
}

export interface MediaUsage {
  kind: "slot" | "treasure" | "gallery" | "settlement";
  label: string;
}

export interface LibraryAsset extends MediaAsset {
  usages: MediaUsage[];
}

export interface AdminTreasure extends PublicTreasure {
  coverMediaId: string | null;
  galleryItems: { mediaId: string; alt: Localized; sortOrder: number }[];
}

export interface AdminWorkspace {
  counts: {
    publishedTreasures: number;
    draftTreasures: number;
    featuredTreasures: number;
    settlements: number;
    contactLinks: number;
  };
  settings: SiteSettings;
  slots: Record<SiteSlotKey, SiteSlot>;
  categories: TreasureCategory[];
  treasures: AdminTreasure[];
  settlements: PublicSettlement[];
  contactDescription: Localized;
  contactLinks: ContactLink[];
  media: LibraryAsset[];
}

export interface TreasureInput {
  id?: string;
  slug: string;
  categoryId: string;
  status: PublicationStatus;
  featured: boolean;
  sortOrder: number;
  title: Localized;
  summary: Localized;
  body: Localized;
  alt: Localized;
  sourceUrl: string;
  coverMediaId: string | null;
  fallbackImage: ImageKey | null;
  gallery: { mediaId: string; alt: Localized; sortOrder: number }[];
}

export interface SettlementInput {
  id?: string;
  slug: string;
  kind: SettlementKind;
  status: PublicationStatus;
  sortOrder: number;
  name: Localized;
  summary: Localized;
  body: Localized;
  alt: Localized;
  coverMediaId: string | null;
}

export interface CategoryInput {
  id?: string;
  slug: string;
  name: Localized;
  description: Localized;
  sortOrder: number;
  reassignTo?: string;
}

export interface ContactLinkInput {
  id?: string;
  kind: ContactKind;
  label: Localized;
  value: string;
  sortOrder: number;
}

export interface SlotInput {
  key: SiteSlotKey;
  mediaId: string | null;
  alt: Localized;
  focalX: number;
  focalY: number;
}

export const EMPTY_LOCALIZED = (): Localized => ({ hy: "", en: "", ru: "" });
