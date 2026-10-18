import type {
  AdminWorkspace,
  CategoryInput,
  ContactLinkInput,
  LibraryAsset,
  Localized,
  MediaAsset,
  MediaUsage,
  SettlementInput,
  SiteSettings,
  SlotInput,
  TreasureInput,
} from "@/lib/cms-types";
import { emptyLocalized } from "@/lib/content-rules";
import {
  asRow,
  asRows,
  emptySlots,
  mapCategory,
  mapContact,
  mapMedia,
  mapSettings,
  mapSettlement,
  mapSlot,
  mapTreasure,
  settingsToRow,
} from "@/lib/mappers";
import {
  getBrowserSupabase,
  supabaseAnonKey,
  supabaseConfigState,
  supabaseUrl,
} from "@/lib/supabase";
import {
  clampFocal,
  limitText,
  normalizeEmail,
  normalizeExternalUrl,
  normalizeInternalPath,
  normalizePhone,
  normalizeSlug,
  validateImageFile,
  type ValidationCode,
} from "@/lib/validators";

export type AdminCode = ValidationCode | "config_missing" | "config_invalid" | "invalid_login" | "not_admin" | "network" | "expired" | "forbidden" | "function_denied" | "constraint" | "conflict" | "in_use" | "generic" | "upload_failed" | "cleanup_failed" | "category_required";

export type AdminResult<T> = { ok: true; data: T } | { ok: false; error: AdminCode };

type DbError = { code?: string; message?: string } | null;

const TREASURE_SELECT = `
  id, slug, status, featured, sort_order, source_url, fallback_image, category_id,
  title_hy, title_en, title_ru, summary_hy, summary_en, summary_ru,
  body_hy, body_en, body_ru, alt_hy, alt_en, alt_ru, created_at, updated_at,
  treasure_categories ( id, slug, name_hy, name_en, name_ru ),
  media_assets ( id, storage_path, label, alt_hy, alt_en, alt_ru, mime_type, byte_size, focal_x, focal_y, created_at, updated_at ),
  treasure_gallery ( id, sort_order, alt_hy, alt_en, alt_ru, media_id,
    media_assets ( id, storage_path, label, alt_hy, alt_en, alt_ru, mime_type, byte_size, focal_x, focal_y, created_at, updated_at )
  )
`;

function fail(error: AdminCode): AdminResult<never> {
  return { ok: false, error };
}

function safeDbError(error: DbError): AdminCode {
  if (!error) return "generic";
  const message = error.message?.toLowerCase() ?? "";
  if (message.includes("permission denied for function") || message.includes("permission denied for schema")) return "function_denied";
  if (error.code === "23514") return "constraint";
  if (error.code === "23505") return "conflict";
  if (error.code === "23503") return "in_use";
  if (error.code === "42501" || error.code === "PGRST301" || error.code === "PGRST116") return "forbidden";
  if (message.includes("jwt")) return "expired";
  return "generic";
}

function changed(result: { data: unknown; error: DbError }): AdminResult<true> {
  if (result.error) return fail(safeDbError(result.error));
  const rows = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
  if (rows.length === 0) return fail("forbidden");
  return { ok: true, data: true };
}

function guardConfig(): AdminResult<true> {
  const state = supabaseConfigState();
  if (state === "missing") return fail("config_missing");
  if (state === "invalid") return fail("config_invalid");
  return { ok: true, data: true };
}

async function requireAdmin(): Promise<AdminResult<{ token: string; userId: string }>> {
  const ready = guardConfig();
  if (!ready.ok) return ready;
  const client = getBrowserSupabase();
  const userResult = await client.auth.getUser();
  if (userResult.error || !userResult.data.user) return fail("expired");
  const profile = await client
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", userResult.data.user.id)
    .maybeSingle();
  if (profile.error) return fail(safeDbError(profile.error));
  if (!profile.data) return fail("not_admin");
  const session = await client.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) return fail("expired");
  return { ok: true, data: { token, userId: userResult.data.user.id } };
}

export async function peekAdmin(): Promise<
  "admin" | "anonymous" | "forbidden" | "config_missing" | "config_invalid" | "network"
> {
  const state = supabaseConfigState();
  if (state === "missing") return "config_missing";
  if (state === "invalid") return "config_invalid";
  try {
    const client = getBrowserSupabase();
    const userResult = await client.auth.getUser();
    if (userResult.error || !userResult.data.user) return "anonymous";
    const profile = await client
      .from("admin_profiles")
      .select("user_id")
      .eq("user_id", userResult.data.user.id)
      .maybeSingle();
    if (profile.error) return "network";
    return profile.data ? "admin" : "forbidden";
  } catch {
    return "network";
  }
}

export async function signInAdmin(email: string, password: string): Promise<AdminResult<{ email: string }>> {
  const ready = guardConfig();
  if (!ready.ok) return ready;
  const normalized = normalizeEmail(email);
  if (!normalized.ok) return fail("invalid_login");
  if (!password) return fail("invalid_login");
  try {
    const client = getBrowserSupabase();
    const { error } = await client.auth.signInWithPassword({
      email: normalized.value,
      password,
    });
    if (error) return fail("invalid_login");
    const status = await peekAdmin();
    if (status !== "admin") {
      await client.auth.signOut();
      if (status === "network") return fail("network");
      return fail("not_admin");
    }
    return { ok: true, data: { email: normalized.value } };
  } catch {
    return fail("network");
  }
}

export async function signOutAdmin(): Promise<void> {
  if (supabaseConfigState() !== "ready") return;
  await getBrowserSupabase().auth.signOut();
}

function locCols(prefix: string, value: Localized, max: number): AdminResult<Record<string, string>> | null {
  const columns: Record<string, string> = {};
  for (const lang of ["hy", "en", "ru"] as const) {
    const limited = limitText(value[lang], max);
    if (!limited.ok) return fail(limited.error);
    columns[`${prefix}_${lang}`] = limited.value;
  }
  return { ok: true, data: columns };
}

function mergeLoc(
  parts: Array<AdminResult<Record<string, string>> | null>,
): AdminResult<Record<string, string>> {
  const data: Record<string, string> = {};
  for (const part of parts) {
    if (!part) continue;
    if (!part.ok) return part;
    Object.assign(data, part.data);
  }
  return { ok: true, data };
}

async function countWhere(
  table: "treasures" | "settlements" | "contact_links",
  filters: Record<string, string | boolean> = {},
): Promise<AdminResult<number>> {
  let query = getBrowserSupabase().from(table).select("id", { count: "exact", head: true });
  for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
  const { count, error } = await query;
  if (error) return fail(safeDbError(error));
  return { ok: true, data: count ?? 0 };
}

export async function loadAdminWorkspace(): Promise<AdminResult<AdminWorkspace>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const client = getBrowserSupabase();
  const [settings, slots, categories, treasures, settlements, contact, links, media, published, drafts, featured, settlementCount, linkCount] =
    await Promise.all([
      client.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      client.from("site_slots").select("*, media_assets(*)"),
      client.from("treasure_categories").select("*").order("sort_order", { ascending: true }),
      client.from("treasures").select(TREASURE_SELECT).order("sort_order", { ascending: true }),
      client.from("settlements").select("*, media_assets(*)").order("sort_order", { ascending: true }),
      client.from("contact_settings").select("*").eq("id", 1).maybeSingle(),
      client.from("contact_links").select("*").order("sort_order", { ascending: true }),
      client.from("media_assets").select("*").order("created_at", { ascending: false }),
      countWhere("treasures", { status: "published" }),
      countWhere("treasures", { status: "draft" }),
      countWhere("treasures", { featured: true }),
      countWhere("settlements"),
      countWhere("contact_links"),
    ]);
  const errors = [settings.error, slots.error, categories.error, treasures.error, settlements.error, contact.error, links.error, media.error];
  const firstError = errors.find((error) => error);
  if (firstError) return fail(safeDbError(firstError));
  if (!published.ok) return published;
  if (!drafts.ok) return drafts;
  if (!featured.ok) return featured;
  if (!settlementCount.ok) return settlementCount;
  if (!linkCount.ok) return linkCount;
  const settingsRow = asRow(settings.data);
  if (!settingsRow) return fail("generic");
  const slotMap = emptySlots();
  for (const row of asRows(slots.data)) {
    const slot = mapSlot(row);
    if (slot) slotMap[slot.key] = slot;
  }
  const assets = asRows(media.data).map(mapMedia);
  const treasureRows = asRows(treasures.data).map(mapTreasure);
  const settlementRows = asRows(settlements.data).map(mapSettlement);
  const usages = new Map<string, MediaUsage[]>();
  const push = (id: string | null, usage: MediaUsage) => {
    if (!id) return;
    const list = usages.get(id) ?? [];
    list.push(usage);
    usages.set(id, list);
  };
  for (const slot of Object.values(slotMap)) push(slot.media?.id ?? null, { kind: "slot", label: slot.key });
  for (const treasure of treasureRows) {
    push(treasure.coverMediaId, { kind: "treasure", label: treasure.slug });
    for (const image of treasure.gallery) push(image.mediaId, { kind: "gallery", label: treasure.slug });
  }
  for (const settlement of settlementRows) {
    push(settlement.coverMediaId, { kind: "settlement", label: settlement.slug });
  }
  const contactRow = asRow(contact.data);
  const library: LibraryAsset[] = assets.map((asset) => ({
    ...asset,
    usages: usages.get(asset.id) ?? [],
  }));
  return {
    ok: true,
    data: {
      counts: {
        publishedTreasures: published.data,
        draftTreasures: drafts.data,
        featuredTreasures: featured.data,
        settlements: settlementCount.data,
        contactLinks: linkCount.data,
      },
      settings: mapSettings(settingsRow),
      slots: slotMap,
      categories: asRows(categories.data).map(mapCategory),
      treasures: treasureRows,
      settlements: settlementRows,
      contactDescription: contactRow
        ? {
            hy: typeof contactRow["description_hy"] === "string" ? contactRow["description_hy"] : "",
            en: typeof contactRow["description_en"] === "string" ? contactRow["description_en"] : "",
            ru: typeof contactRow["description_ru"] === "string" ? contactRow["description_ru"] : "",
          }
        : emptyLocalized(),
      contactLinks: asRows(links.data).map(mapContact),
      media: library,
    },
  };
}

export async function saveSettings(settings: SiteSettings): Promise<AdminResult<true>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const treasuresHref = normalizeInternalPath(settings.ctaTreasuresHref);
  const settlementsHref = normalizeInternalPath(settings.ctaSettlementsHref);
  if (!treasuresHref.ok || !settlementsHref.ok) return fail("bad_path");
  const packed = settingsToRow({
    ...settings,
    ctaTreasuresHref: treasuresHref.value,
    ctaSettlementsHref: settlementsHref.value,
  });
  for (const value of Object.values(packed)) {
    if (typeof value === "string" && value.length > 8000) return fail("too_long");
  }
  return changed(await getBrowserSupabase().from("site_settings").update(packed).eq("id", 1).select("id"));
}

export async function saveSlot(input: SlotInput): Promise<AdminResult<true>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const alt = locCols("alt", input.alt, 300);
  if (!alt?.ok) return alt ?? fail("generic");
  return changed(
    await getBrowserSupabase()
      .from("site_slots")
      .update({
        media_id: input.mediaId,
        focal_x: clampFocal(input.focalX),
        focal_y: clampFocal(input.focalY),
        ...alt.data,
      })
      .eq("slot_key", input.key)
      .select("slot_key"),
  );
}

function xhrUpload(
  path: string,
  file: File,
  token: string,
  upsert: boolean,
  onProgress?: (value: number) => void,
): Promise<AdminResult<true>> {
  const encoded = path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", file);
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${supabaseUrl()}/storage/v1/object/site-media/${encoded}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", supabaseAnonKey());
    xhr.setRequestHeader("x-upsert", upsert ? "true" : "false");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve({ ok: true, data: true });
      else resolve(fail(uploadFailure(xhr.status, xhr.responseText)));
    };
    xhr.onerror = () => resolve(fail("upload_failed"));
    xhr.send(body);
  });
}

function uploadFailure(status: number, responseText: string): AdminCode {
  const message = responseText.toLowerCase();
  if (message.includes("permission denied for function") || message.includes("permission denied for schema")) return "function_denied";
  if (message.includes("mime") || message.includes("invalid_mime")) return "bad_file_type";
  if (message.includes("payload too large") || message.includes("maximum")) return "bad_file_size";
  if (status === 401 || status === 403 || message.includes("row-level security")) return "forbidden";
  return "upload_failed";
}

export async function uploadImage(
  file: File,
  label: string,
  onProgress?: (value: number) => void,
): Promise<AdminResult<MediaAsset>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const valid = validateImageFile(file);
  if (!valid.ok) return valid;
  const decoded = await decodeImage(file);
  if (!decoded) return fail("bad_image");
  const limited = limitText(label.trim() || file.name.replace(/\.[^.]+$/, ""), 120);
  if (!limited.ok) return limited;
  const path = `${crypto.randomUUID()}.${valid.value}`;
  const uploaded = await xhrUpload(path, file, auth.data.token, false, onProgress);
  if (!uploaded.ok) return uploaded;
  const inserted = await getBrowserSupabase()
    .from("media_assets")
    .insert({
      storage_path: path,
      label: limited.value,
      mime_type: file.type,
      byte_size: file.size,
      created_by: auth.data.userId,
    })
    .select("*")
    .single();
  if (inserted.error || !inserted.data) {
    await getBrowserSupabase().storage.from("site-media").remove([path]);
    return fail(safeDbError(inserted.error));
  }
  const row = asRow(inserted.data);
  if (!row) return fail("generic");
  return { ok: true, data: mapMedia(row) };
}

export async function replaceImageFile(
  id: string,
  file: File,
  onProgress?: (value: number) => void,
): Promise<AdminResult<MediaAsset>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const valid = validateImageFile(file);
  if (!valid.ok) return valid;
  if (!(await decodeImage(file))) return fail("bad_image");
  const existing = await getBrowserSupabase().from("media_assets").select("*").eq("id", id).maybeSingle();
  if (existing.error || !existing.data) return fail(existing.error ? safeDbError(existing.error) : "generic");
  const row = asRow(existing.data);
  if (!row) return fail("generic");
  const path = typeof row["storage_path"] === "string" ? row["storage_path"] : "";
  if (!path) return fail("generic");
  const uploaded = await xhrUpload(path, file, auth.data.token, true, onProgress);
  if (!uploaded.ok) return uploaded;
  const updated = await getBrowserSupabase()
    .from("media_assets")
    .update({ mime_type: file.type, byte_size: file.size })
    .eq("id", id)
    .select("*")
    .single();
  if (updated.error || !updated.data) return fail(safeDbError(updated.error));
  const next = asRow(updated.data);
  if (!next) return fail("generic");
  return { ok: true, data: mapMedia(next) };
}

export async function updateMediaMeta(
  id: string,
  label: string,
  alt: Localized,
  focalX: number,
  focalY: number,
): Promise<AdminResult<true>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const limited = limitText(label.trim(), 120);
  if (!limited.ok) return limited;
  const alts = locCols("alt", alt, 300);
  if (!alts?.ok) return alts ?? fail("generic");
  return changed(
    await getBrowserSupabase()
      .from("media_assets")
      .update({
        label: limited.value,
        focal_x: clampFocal(focalX),
        focal_y: clampFocal(focalY),
        ...alts.data,
      })
      .eq("id", id)
      .select("id"),
  );
}

export async function deleteMedia(id: string): Promise<AdminResult<true>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const client = getBrowserSupabase();
  const existing = await client.from("media_assets").select("id, storage_path").eq("id", id).maybeSingle();
  if (existing.error || !existing.data) return fail(existing.error ? safeDbError(existing.error) : "generic");
  const inSlot = await client.from("site_slots").select("slot_key").eq("media_id", id);
  const inTreasure = await client.from("treasures").select("slug").eq("cover_media_id", id);
  const inGallery = await client.from("treasure_gallery").select("id").eq("media_id", id);
  const inSettlement = await client.from("settlements").select("slug").eq("cover_media_id", id);
  if (inSlot.error || inTreasure.error || inGallery.error || inSettlement.error) return fail("generic");
  const used = (inSlot.data?.length ?? 0) + (inTreasure.data?.length ?? 0) + (inGallery.data?.length ?? 0) + (inSettlement.data?.length ?? 0);
  if (used > 0) return fail("in_use");
  const removed = await changed(await client.from("media_assets").delete().eq("id", id).select("id"));
  if (!removed.ok) return removed;
  const path = asRow(existing.data)?.["storage_path"];
  if (typeof path === "string" && path) {
    const storage = await client.storage.from("site-media").remove([path]);
    if (storage.error) return fail("cleanup_failed");
  }
  return { ok: true, data: true };
}

async function replaceGallery(
  treasureId: string,
  gallery: TreasureInput["gallery"],
): Promise<AdminResult<true>> {
  const client = getBrowserSupabase();
  const deleted = await client.from("treasure_gallery").delete().eq("treasure_id", treasureId);
  if (deleted.error) return fail(safeDbError(deleted.error));
  if (gallery.length === 0) return { ok: true, data: true };
  const rows = [];
  for (const item of gallery) {
    const alt = locCols("alt", item.alt, 300);
    if (!alt?.ok) return alt ?? fail("generic");
    rows.push({
      treasure_id: treasureId,
      media_id: item.mediaId,
      sort_order: item.sortOrder,
      ...alt.data,
    });
  }
  const inserted = await client.from("treasure_gallery").insert(rows);
  if (inserted.error) return fail(safeDbError(inserted.error));
  return { ok: true, data: true };
}

export async function saveTreasure(input: TreasureInput): Promise<AdminResult<{ id: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const slug = normalizeSlug(input.slug);
  if (!slug.ok) return slug;
  if (!input.categoryId) return fail("category_required");
  const source = input.sourceUrl.trim()
    ? normalizeExternalUrl(input.sourceUrl)
    : ({ ok: true, value: "" } as const);
  if (!source.ok) return source;
  const columns = mergeLoc([
    locCols("title", input.title, 200),
    locCols("summary", input.summary, 600),
    locCols("body", input.body, 8000),
    locCols("alt", input.alt, 300),
  ]);
  if (!columns.ok) return columns;
  const row = {
    slug: slug.value,
    category_id: input.categoryId,
    status: input.status,
    featured: input.featured,
    sort_order: Math.max(0, Math.min(10000, Math.round(input.sortOrder) || 0)),
    source_url: source.value || null,
    cover_media_id: input.coverMediaId,
    fallback_image: input.fallbackImage,
    ...columns.data,
  };
  const client = getBrowserSupabase();
  if (input.id) {
    const updated = await client.from("treasures").update(row).eq("id", input.id).select("id").single();
    if (updated.error || !updated.data) return fail(safeDbError(updated.error));
    const gallery = await replaceGallery(input.id, input.gallery.filter((item) => item.mediaId));
    if (!gallery.ok) return gallery;
    return { ok: true, data: { id: input.id } };
  }
  const inserted = await client.from("treasures").insert(row).select("id").single();
  if (inserted.error || !inserted.data) return fail(safeDbError(inserted.error));
  const id = asRow(inserted.data)?.["id"];
  if (typeof id !== "string") return fail("generic");
  const gallery = await replaceGallery(id, input.gallery.filter((item) => item.mediaId));
  if (!gallery.ok) return gallery;
  return { ok: true, data: { id } };
}

export async function deleteTreasure(id: string): Promise<AdminResult<true>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  return changed(await getBrowserSupabase().from("treasures").delete().eq("id", id).select("id"));
}

export async function saveSettlement(input: SettlementInput): Promise<AdminResult<{ id: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const slug = normalizeSlug(input.slug);
  if (!slug.ok) return slug;
  const columns = mergeLoc([
    locCols("name", input.name, 200),
    locCols("summary", input.summary, 600),
    locCols("body", input.body, 8000),
    locCols("alt", input.alt, 300),
  ]);
  if (!columns.ok) return columns;
  const row = {
    slug: slug.value,
    kind: input.kind,
    status: input.status,
    sort_order: Math.max(0, Math.min(10000, Math.round(input.sortOrder) || 0)),
    cover_media_id: input.coverMediaId,
    ...columns.data,
  };
  const client = getBrowserSupabase();
  if (input.id) {
    const updated = await client.from("settlements").update(row).eq("id", input.id).select("id").single();
    if (updated.error) return fail(safeDbError(updated.error));
    return { ok: true, data: { id: input.id } };
  }
  const inserted = await client.from("settlements").insert(row).select("id").single();
  if (inserted.error || !inserted.data) return fail(safeDbError(inserted.error));
  const id = asRow(inserted.data)?.["id"];
  if (typeof id !== "string") return fail("generic");
  return { ok: true, data: { id } };
}

export async function deleteSettlement(id: string): Promise<AdminResult<true>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  return changed(await getBrowserSupabase().from("settlements").delete().eq("id", id).select("id"));
}

export async function saveCategory(input: CategoryInput): Promise<AdminResult<{ id: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const slug = normalizeSlug(input.slug);
  if (!slug.ok) return slug;
  const columns = mergeLoc([locCols("name", input.name, 200), locCols("description", input.description, 2000)]);
  if (!columns.ok) return columns;
  const row = {
    slug: slug.value,
    sort_order: Math.max(0, Math.min(10000, Math.round(input.sortOrder) || 0)),
    ...columns.data,
  };
  const client = getBrowserSupabase();
  if (input.id) {
    const updated = await client.from("treasure_categories").update(row).eq("id", input.id).select("id").single();
    if (updated.error) return fail(safeDbError(updated.error));
    return { ok: true, data: { id: input.id } };
  }
  const inserted = await client.from("treasure_categories").insert(row).select("id").single();
  if (inserted.error || !inserted.data) return fail(safeDbError(inserted.error));
  const id = asRow(inserted.data)?.["id"];
  if (typeof id !== "string") return fail("generic");
  return { ok: true, data: { id } };
}

export async function deleteCategory(id: string, reassignTo?: string): Promise<AdminResult<true>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const client = getBrowserSupabase();
  const used = await client.from("treasures").select("id").eq("category_id", id);
  if (used.error) return fail(safeDbError(used.error));
  if ((used.data?.length ?? 0) > 0) {
    if (!reassignTo || reassignTo === id) return fail("in_use");
    const moved = await client.from("treasures").update({ category_id: reassignTo }).eq("category_id", id);
    if (moved.error) return fail(safeDbError(moved.error));
  }
  return changed(await client.from("treasure_categories").delete().eq("id", id).select("id"));
}

export async function saveContactDescription(description: Localized): Promise<AdminResult<true>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const columns = locCols("description", description, 2000);
  if (!columns?.ok) return columns ?? fail("generic");
  return changed(await getBrowserSupabase().from("contact_settings").update(columns.data).eq("id", 1).select("id"));
}

export async function saveContactLink(input: ContactLinkInput): Promise<AdminResult<{ id: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  let value = "";
  if (input.kind === "email") {
    const email = normalizeEmail(input.value);
    if (!email.ok) return email;
    value = email.value;
  } else if (input.kind === "phone") {
    const phone = normalizePhone(input.value);
    if (!phone.ok) return phone;
    value = phone.value;
  } else {
    const url = normalizeExternalUrl(input.value);
    if (!url.ok) return url;
    value = url.value;
  }
  const labels = locCols("label", input.label, 120);
  if (!labels?.ok) return labels ?? fail("generic");
  const row = {
    kind: input.kind,
    value,
    sort_order: Math.max(0, Math.min(10000, Math.round(input.sortOrder) || 0)),
    ...labels.data,
  };
  const client = getBrowserSupabase();
  if (input.id) {
    const updated = await client.from("contact_links").update(row).eq("id", input.id).select("id").single();
    if (updated.error) return fail(safeDbError(updated.error));
    return { ok: true, data: { id: input.id } };
  }
  const inserted = await client.from("contact_links").insert(row).select("id").single();
  if (inserted.error || !inserted.data) return fail(safeDbError(inserted.error));
  const id = asRow(inserted.data)?.["id"];
  if (typeof id !== "string") return fail("generic");
  return { ok: true, data: { id } };
}

export async function deleteContactLink(id: string): Promise<AdminResult<true>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  return changed(await getBrowserSupabase().from("contact_links").delete().eq("id", id).select("id"));
}

async function decodeImage(file: File): Promise<boolean> {
  try {
    const bitmap = await createImageBitmap(file);
    const ok = bitmap.width > 0 && bitmap.height > 0;
    bitmap.close();
    return ok;
  } catch {
    return false;
  }
}

