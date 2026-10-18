import { TREASURES, type ImageKey } from "@/data/content";
import type {
  AdminTreasure,
  ContactLink,
  Localized,
  PublicSettlement,
  PublicSite,
  PublicTreasure,
  SiteSlotKey,
} from "@/lib/cms-types";
import { emptyLocalized } from "@/lib/content-rules";
import { homeTreasures } from "@/lib/content-rules";
import {
  asRow,
  asRows,
  emptySlots,
  mapContact,
  mapSettings,
  mapSettlement,
  mapSlot,
  mapTreasure,
  toPublicTreasure,
} from "@/lib/mappers";
import { getPublicSupabase, supabaseConfigState } from "@/lib/supabase";

const TREASURE_SELECT = `
  id, slug, status, featured, sort_order, source_url, fallback_image, category_id,
  title_hy, title_en, title_ru, summary_hy, summary_en, summary_ru,
  body_hy, body_en, body_ru, alt_hy, alt_en, alt_ru, created_at, updated_at,
  treasure_categories ( id, slug, name_hy, name_en, name_ru, description_hy, description_en, description_ru, sort_order ),
  media_assets ( id, storage_path, label, alt_hy, alt_en, alt_ru, mime_type, byte_size, focal_x, focal_y, created_at, updated_at ),
  treasure_gallery ( id, sort_order, alt_hy, alt_en, alt_ru, media_id,
    media_assets ( id, storage_path, label, alt_hy, alt_en, alt_ru, mime_type, byte_size, focal_x, focal_y, created_at, updated_at )
  )
`;

const SETTLEMENT_SELECT = `
  id, slug, kind, status, sort_order, name_hy, name_en, name_ru,
  summary_hy, summary_en, summary_ru, body_hy, body_en, body_ru,
  alt_hy, alt_en, alt_ru, created_at, updated_at,
  media_assets ( id, storage_path, label, alt_hy, alt_en, alt_ru, mime_type, byte_size, focal_x, focal_y, created_at, updated_at )
`;

function localTreasure(slug: string, image: ImageKey, category: Localized, title: Localized, summary: Localized, body: Localized): AdminTreasure {
  return {
    id: slug,
    slug,
    status: "draft",
    featured: false,
    sortOrder: 0,
    categoryId: slug,
    categorySlug: slug,
    category,
    title,
    summary,
    body,
    alt: emptyLocalized(),
    sourceUrl: null,
    coverMediaId: null,
    coverUrl: null,
    fallbackImage: image,
    focalX: 50,
    focalY: 50,
    gallery: [],
    galleryItems: [],
    createdAt: null,
    updatedAt: null,
  };
}

function localTreasures(): AdminTreasure[] {
  return TREASURES.map((item, index) => ({
    ...localTreasure(item.slug, item.image, item.category, item.title, item.summary, item.body),
    sortOrder: index,
  }));
}

function blankSite(source: PublicSite["source"], error: string | null): PublicSite {
  return {
    source,
    error,
    settings: null,
    slots: emptySlots(),
    contactDescription: null,
    contactLinks: [],
  };
}

export const repository = {
  async getPublicSite(): Promise<PublicSite> {
    const config = supabaseConfigState();
    if (config === "missing") return blankSite("local", null);
    if (config === "invalid") return blankSite("database", "invalid-config");
    try {
      const client = getPublicSupabase();
      const [settings, slots, contact, links] = await Promise.all([
        client.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        client.from("site_slots").select("*, media_assets(*)"),
        client.from("contact_settings").select("*").eq("id", 1).maybeSingle(),
        client.from("contact_links").select("*").order("sort_order", { ascending: true }),
      ]);
      if (settings.error || slots.error || contact.error || links.error) {
        return blankSite("database", "unavailable");
      }
      const slotMap = emptySlots();
      for (const row of asRows(slots.data)) {
        const slot = mapSlot(row);
        if (slot) slotMap[slot.key] = slot;
      }
      const settingsRow = asRow(settings.data);
      const contactRow = asRow(contact.data);
      return {
        source: "database",
        error: null,
        settings: settingsRow ? mapSettings(settingsRow) : null,
        slots: slotMap,
        contactDescription: contactRow
          ? {
              hy: typeof contactRow["description_hy"] === "string" ? contactRow["description_hy"] : "",
              en: typeof contactRow["description_en"] === "string" ? contactRow["description_en"] : "",
              ru: typeof contactRow["description_ru"] === "string" ? contactRow["description_ru"] : "",
            }
          : null,
        contactLinks: asRows(links.data).map(mapContact),
      };
    } catch {
      return blankSite("database", "unavailable");
    }
  },

  async listHomeTreasures(): Promise<{ items: PublicTreasure[]; error: boolean }> {
    const listed = await this.listTreasures();
    if (listed.error) return { items: [], error: true };
    const site = supabaseConfigState() === "missing" ? "local" : "database";
    return { items: homeTreasures(listed.items, site), error: false };
  },

  async listTreasures(): Promise<{ items: PublicTreasure[]; error: boolean }> {
    if (supabaseConfigState() === "missing") {
      return { items: localTreasures().map(toPublicTreasure), error: false };
    }
    if (supabaseConfigState() !== "ready") return { items: [], error: true };
    try {
      const { data, error } = await getPublicSupabase()
        .from("treasures")
        .select(TREASURE_SELECT)
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      if (error) return { items: [], error: true };
      return { items: asRows(data).map((row) => toPublicTreasure(mapTreasure(row))), error: false };
    } catch {
      return { items: [], error: true };
    }
  },

  async getTreasure(slug: string): Promise<{ treasure: PublicTreasure | null; error: boolean }> {
    if (supabaseConfigState() === "missing") {
      const found = localTreasures().find((item) => item.slug === slug) ?? null;
      return { treasure: found ? toPublicTreasure(found) : null, error: false };
    }
    if (supabaseConfigState() !== "ready") return { treasure: null, error: true };
    try {
      const { data, error } = await getPublicSupabase()
        .from("treasures")
        .select(TREASURE_SELECT)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) return { treasure: null, error: true };
      const row = asRow(data);
      return { treasure: row ? toPublicTreasure(mapTreasure(row)) : null, error: false };
    } catch {
      return { treasure: null, error: true };
    }
  },

  async listSettlements(): Promise<{ items: PublicSettlement[]; error: boolean }> {
    if (supabaseConfigState() === "missing") return { items: [], error: false };
    if (supabaseConfigState() !== "ready") return { items: [], error: true };
    try {
      const { data, error } = await getPublicSupabase()
        .from("settlements")
        .select(SETTLEMENT_SELECT)
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      if (error) return { items: [], error: true };
      return { items: asRows(data).map(mapSettlement), error: false };
    } catch {
      return { items: [], error: true };
    }
  },

  async getSettlement(slug: string): Promise<{ settlement: PublicSettlement | null; error: boolean }> {
    if (supabaseConfigState() === "missing") return { settlement: null, error: false };
    if (supabaseConfigState() !== "ready") return { settlement: null, error: true };
    try {
      const { data, error } = await getPublicSupabase()
        .from("settlements")
        .select(SETTLEMENT_SELECT)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) return { settlement: null, error: true };
      const row = asRow(data);
      return { settlement: row ? mapSettlement(row) : null, error: false };
    } catch {
      return { settlement: null, error: true };
    }
  },
};

export function faviconHref(slots: Record<SiteSlotKey, { media: { url: string } | null }>): string {
  return slots.favicon.media?.url || "/favicon.ico";
}

export type { ContactLink };
