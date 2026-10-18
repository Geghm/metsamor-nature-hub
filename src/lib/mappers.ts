import type { ImageKey } from "@/data/content";
import type {
  AdminTreasure,
  ContactKind,
  ContactLink,
  GalleryImage,
  Localized,
  MediaAsset,
  PublicationStatus,
  PublicSettlement,
  PublicTreasure,
  SettlementKind,
  SiteSettings,
  SiteSlot,
  SiteSlotKey,
  TreasureCategory,
} from "@/lib/cms-types";
import { SITE_SLOT_KEYS } from "@/lib/cms-types";
import { mediaPublicUrl } from "@/lib/supabase";

const IMAGE_KEYS = new Set<ImageKey>([
  "vordan-karmir",
  "biodiversity",
  "landscapes",
  "traditions",
  "green",
  "awareness",
]);

type Row = Record<string, unknown>;

export function asRow(value: unknown): Row | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Row;
}

export function asRows(value: unknown): Row[] {
  if (Array.isArray(value)) return value.map(asRow).filter((row): row is Row => row !== null);
  const one = asRow(value);
  return one ? [one] : [];
}

function str(row: Row, key: string): string {
  const value = row[key];
  return typeof value === "string" ? value : "";
}

function num(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function localized(row: Row, prefix: string): Localized {
  return { hy: str(row, `${prefix}_hy`), en: str(row, `${prefix}_en`), ru: str(row, `${prefix}_ru`) };
}

function status(value: unknown): PublicationStatus {
  if (value === "published" || value === "archived" || value === "draft") return value;
  return "draft";
}

export function mapMedia(row: Row): MediaAsset {
  const updatedAt = str(row, "updated_at");
  const storagePath = str(row, "storage_path");
  return {
    id: str(row, "id"),
    storagePath,
    url: storagePath ? mediaPublicUrl(storagePath, updatedAt || str(row, "created_at") || "1") : "",
    label: str(row, "label"),
    alt: localized(row, "alt"),
    mimeType: str(row, "mime_type"),
    byteSize: num(row["byte_size"]),
    focalX: num(row["focal_x"], 50),
    focalY: num(row["focal_y"], 50),
    createdAt: str(row, "created_at"),
    updatedAt,
  };
}

export function emptySlot(key: SiteSlotKey): SiteSlot {
  return { key, media: null, alt: { hy: "", en: "", ru: "" }, focalX: 50, focalY: 50, updatedAt: null };
}

export function emptySlots(): Record<SiteSlotKey, SiteSlot> {
  return {
    hero: emptySlot("hero"),
    hero_secondary: emptySlot("hero_secondary"),
    about: emptySlot("about"),
    band: emptySlot("band"),
    favicon: emptySlot("favicon"),
  };
}

export function mapSlot(row: Row): SiteSlot | null {
  const key = str(row, "slot_key");
  if (!SITE_SLOT_KEYS.includes(key as SiteSlotKey)) return null;
  const media = asRow(row["media_assets"]);
  return {
    key: key as SiteSlotKey,
    media: media ? mapMedia(media) : null,
    alt: localized(row, "alt"),
    focalX: num(row["focal_x"], 50),
    focalY: num(row["focal_y"], 50),
    updatedAt: str(row, "updated_at") || null,
  };
}

export function mapSettings(row: Row): SiteSettings {
  return {
    heroTitle: localized(row, "hero_title"),
    heroSubtitle: localized(row, "hero_subtitle"),
    ctaTreasuresLabel: localized(row, "cta_treasures_label"),
    ctaSettlementsLabel: localized(row, "cta_settlements_label"),
    ctaTreasuresHref: str(row, "cta_treasures_href") || "/treasures",
    ctaSettlementsHref: str(row, "cta_settlements_href") || "/settlements",
    featuredEyebrow: localized(row, "featured_eyebrow"),
    featuredTitle: localized(row, "featured_title"),
    pillar1Title: localized(row, "pillar_1_title"),
    pillar1Body: localized(row, "pillar_1_body"),
    pillar2Title: localized(row, "pillar_2_title"),
    pillar2Body: localized(row, "pillar_2_body"),
    pillar3Title: localized(row, "pillar_3_title"),
    pillar3Body: localized(row, "pillar_3_body"),
    bandTitle: localized(row, "band_title"),
    bandBody: localized(row, "band_body"),
    aboutTitle: localized(row, "about_title"),
    aboutBody: localized(row, "about_body"),
    aboutNote: localized(row, "about_note"),
    footerBody: localized(row, "footer_body"),
    rightsLine: localized(row, "rights_line"),
    treasuresLead: localized(row, "treasures_lead"),
    settlementsLead: localized(row, "settlements_lead"),
    contactLead: localized(row, "contact_lead"),
    updatedAt: str(row, "updated_at") || null,
  };
}

export function settingsToRow(settings: SiteSettings): Row {
  const pack = (prefix: string, value: Localized) => ({
    [`${prefix}_hy`]: value.hy,
    [`${prefix}_en`]: value.en,
    [`${prefix}_ru`]: value.ru,
  });
  return {
    ...pack("hero_title", settings.heroTitle),
    ...pack("hero_subtitle", settings.heroSubtitle),
    ...pack("cta_treasures_label", settings.ctaTreasuresLabel),
    ...pack("cta_settlements_label", settings.ctaSettlementsLabel),
    cta_treasures_href: settings.ctaTreasuresHref,
    cta_settlements_href: settings.ctaSettlementsHref,
    ...pack("featured_eyebrow", settings.featuredEyebrow),
    ...pack("featured_title", settings.featuredTitle),
    ...pack("pillar_1_title", settings.pillar1Title),
    ...pack("pillar_1_body", settings.pillar1Body),
    ...pack("pillar_2_title", settings.pillar2Title),
    ...pack("pillar_2_body", settings.pillar2Body),
    ...pack("pillar_3_title", settings.pillar3Title),
    ...pack("pillar_3_body", settings.pillar3Body),
    ...pack("band_title", settings.bandTitle),
    ...pack("band_body", settings.bandBody),
    ...pack("about_title", settings.aboutTitle),
    ...pack("about_body", settings.aboutBody),
    ...pack("about_note", settings.aboutNote),
    ...pack("footer_body", settings.footerBody),
    ...pack("rights_line", settings.rightsLine),
    ...pack("treasures_lead", settings.treasuresLead),
    ...pack("settlements_lead", settings.settlementsLead),
    ...pack("contact_lead", settings.contactLead),
  };
}

export function mapCategory(row: Row): TreasureCategory {
  return {
    id: str(row, "id"),
    slug: str(row, "slug"),
    name: localized(row, "name"),
    description: localized(row, "description"),
    sortOrder: num(row["sort_order"]),
    updatedAt: str(row, "updated_at") || null,
  };
}

function fallbackImage(value: unknown): ImageKey | null {
  return typeof value === "string" && IMAGE_KEYS.has(value as ImageKey) ? (value as ImageKey) : null;
}

function mapGallery(row: Row): GalleryImage | null {
  const media = asRow(row["media_assets"]);
  if (!media) return null;
  const asset = mapMedia(media);
  const own = localized(row, "alt");
  const alt = {
    hy: own.hy || asset.alt.hy,
    en: own.en || asset.alt.en,
    ru: own.ru || asset.alt.ru,
  };
  return {
    id: str(row, "id"),
    mediaId: asset.id,
    url: asset.url,
    alt,
    focalX: asset.focalX,
    focalY: asset.focalY,
    sortOrder: num(row["sort_order"]),
  };
}

export function mapTreasure(row: Row): AdminTreasure {
  const category = asRow(row["treasure_categories"]);
  const cover = asRow(row["media_assets"]);
  const coverAsset = cover ? mapMedia(cover) : null;
  const gallery = asRows(row["treasure_gallery"])
    .map(mapGallery)
    .filter((item): item is GalleryImage => item !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const categoryName = category ? localized(category, "name") : { hy: "", en: "", ru: "" };
  return {
    id: str(row, "id"),
    slug: str(row, "slug"),
    status: status(row["status"]),
    featured: row["featured"] === true,
    sortOrder: num(row["sort_order"]),
    categoryId: str(row, "category_id"),
    categorySlug: category ? str(category, "slug") : "",
    category: categoryName,
    title: localized(row, "title"),
    summary: localized(row, "summary"),
    body: localized(row, "body"),
    alt: localized(row, "alt"),
    sourceUrl: str(row, "source_url") || null,
    coverMediaId: coverAsset?.id ?? null,
    coverUrl: coverAsset?.url ?? null,
    fallbackImage: fallbackImage(row["fallback_image"]),
    focalX: coverAsset?.focalX ?? 50,
    focalY: coverAsset?.focalY ?? 50,
    gallery,
    createdAt: str(row, "created_at") || null,
    updatedAt: str(row, "updated_at") || null,
    galleryItems: gallery.map((item) => ({
      mediaId: item.mediaId,
      alt: item.alt,
      sortOrder: item.sortOrder,
    })),
  };
}

export function mapSettlement(row: Row): PublicSettlement {
  const cover = asRow(row["media_assets"]);
  const coverAsset = cover ? mapMedia(cover) : null;
  const kind: SettlementKind = row["kind"] === "town" ? "town" : "village";
  return {
    id: str(row, "id"),
    slug: str(row, "slug"),
    kind,
    status: status(row["status"]),
    name: localized(row, "name"),
    summary: localized(row, "summary"),
    body: localized(row, "body"),
    alt: localized(row, "alt"),
    coverMediaId: coverAsset?.id ?? (typeof row["cover_media_id"] === "string" ? row["cover_media_id"] : null),
    coverUrl: coverAsset?.url ?? null,
    focalX: coverAsset?.focalX ?? 50,
    focalY: coverAsset?.focalY ?? 50,
    sortOrder: num(row["sort_order"]),
    createdAt: str(row, "created_at") || null,
    updatedAt: str(row, "updated_at") || null,
  };
}

export function mapContact(row: Row): ContactLink {
  const kind = str(row, "kind");
  const safe: ContactKind =
    kind === "email" || kind === "phone" || kind === "instagram" || kind === "facebook" || kind === "other"
      ? kind
      : "other";
  return {
    id: str(row, "id"),
    kind: safe,
    label: localized(row, "label"),
    value: str(row, "value"),
    sortOrder: num(row["sort_order"]),
    updatedAt: str(row, "updated_at") || null,
  };
}

export function toPublicTreasure(treasure: AdminTreasure): PublicTreasure {
  const { galleryItems: _galleryItems, ...rest } = treasure;
  return rest;
}
