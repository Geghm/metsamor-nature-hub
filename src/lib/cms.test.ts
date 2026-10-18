import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { homeTreasures, publishedFeatured, resolveSlotImage, textForLanguage } from "@/lib/content-rules";
import { emptySlot } from "@/lib/mappers";
import { isAdminShortcut, isEditableEventTarget } from "@/lib/shortcut";
import { isUnsafeSupabaseKey, supabaseConfigState } from "@/lib/supabase";
import { normalizeEmail, normalizeExternalUrl, normalizeSlug, validateImageFile } from "@/lib/validators";
import { repository } from "@/lib/repository";

describe("content rules", () => {
  it("shows a featured treasure only when it is published", () => {
    const rows = [
      { id: "draft", featured: true, status: "draft" },
      { id: "live", featured: true, status: "published" },
      { id: "plain", featured: false, status: "published" },
    ];
    expect(publishedFeatured(rows).map((row) => row.id)).toEqual(["live"]);
  });

  it("keeps the bundled exhibition cards when the database is not connected", () => {
    const rows = [
      { featured: false, status: "draft" as const, sortOrder: 1 },
      { featured: false, status: "draft" as const, sortOrder: 0 },
    ];
    expect(homeTreasures(rows, "local").map((row) => row.sortOrder)).toEqual([0, 1]);
    expect(homeTreasures(rows, "database")).toEqual([]);
  });

  it("does not copy an Armenian value into an empty English field", () => {
    expect(textForLanguage({ hy: "Մեծամոր", en: "", ru: "" }, "en")).toEqual({
      text: "",
      missing: true,
    });
  });

  it("uses a section image when one is saved and the built-in image otherwise", () => {
    const empty = emptySlot("hero");
    expect(resolveSlotImage(empty, "/fallback.jpg").src).toBe("/fallback.jpg");
    const withMedia = {
      ...empty,
      media: {
        ...empty,
        id: "1",
        storagePath: "a.jpg",
        url: "https://example.test/a.jpg?v=2",
        label: "",
        alt: { hy: "", en: "", ru: "" },
        mimeType: "image/jpeg",
        byteSize: 10,
        focalX: 20,
        focalY: 30,
        createdAt: "",
        updatedAt: "",
      },
      focalX: 12,
      focalY: 80,
    };
    expect(resolveSlotImage(withMedia, "/fallback.jpg")).toEqual({
      src: "https://example.test/a.jpg?v=2",
      focalX: 12,
      focalY: 80,
    });
  });
});

describe("validators", () => {
  it("normalizes public links to https and rejects unsafe protocols", () => {
    expect(normalizeExternalUrl("instagram.com/metsamor")).toEqual({
      ok: true,
      value: "https://instagram.com/metsamor",
    });
    expect(normalizeExternalUrl("http://example.com/path").ok).toBe(true);
    expect(normalizeExternalUrl("javascript:alert(1)").ok).toBe(false);
    expect(normalizeExternalUrl("data:text/html,hi").ok).toBe(false);
  });

  it("accepts only web image files under 5 MB", () => {
    expect(validateImageFile({ name: "photo.jpg", type: "image/jpeg", size: 1000 }).ok).toBe(true);
    expect(validateImageFile({ name: "icon.svg", type: "image/svg+xml", size: 1000 }).ok).toBe(false);
    expect(validateImageFile({ name: "big.jpg", type: "image/jpeg", size: 6 * 1024 * 1024 }).ok).toBe(false);
  });

  it("builds a latin slug and a normalized email", () => {
    expect(normalizeSlug("Vordan Karmir")).toEqual({ ok: true, value: "vordan-karmir" });
    expect(normalizeSlug("Մեծամոր").ok).toBe(false);
    expect(normalizeEmail(" Admin@Example.com ")).toEqual({ ok: true, value: "admin@example.com" });
  });
});

describe("admin shortcut", () => {
  it("matches ctrl or command with shift and F", () => {
    expect(isAdminShortcut({ key: "F", ctrlKey: true, metaKey: false, shiftKey: true, altKey: false })).toBe(true);
    expect(isAdminShortcut({ key: "f", ctrlKey: false, metaKey: true, shiftKey: true, altKey: false })).toBe(true);
    expect(isAdminShortcut({ key: "f", ctrlKey: true, metaKey: false, shiftKey: false, altKey: false })).toBe(false);
    expect(isAdminShortcut({ key: "a", ctrlKey: true, metaKey: false, shiftKey: true, altKey: false })).toBe(false);
  });

  it("ignores editable fields", () => {
    expect(isEditableEventTarget(document.createElement("input"))).toBe(true);
    expect(isEditableEventTarget(document.createElement("textarea"))).toBe(true);
    expect(isEditableEventTarget(document.createElement("div"))).toBe(false);
  });
});

describe("supabase safety", () => {
  it("rejects a service-role key", () => {
    const payload = btoa(JSON.stringify({ role: "service_role" }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(isUnsafeSupabaseKey(`header.${payload}.sig`)).toBe(true);
    expect(isUnsafeSupabaseKey("sb_secret_example")).toBe(true);
    const anon = btoa(JSON.stringify({ role: "anon" }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(isUnsafeSupabaseKey(`header.${anon}.sig`)).toBe(false);
  });
});

describe("local public data", () => {
  it("keeps the settlement directory empty until official records are published", async () => {
    const result = await repository.listSettlements();
    expect(result.error).toBe(false);
    expect(result.items).toEqual([]);
  });

  it("shows bundled drafts only when Supabase is not configured", async () => {
    const result = await repository.listHomeTreasures();
    expect(result.error).toBe(false);
    if (supabaseConfigState() === "missing") {
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.every((item) => item.status === "draft")).toBe(true);
      return;
    }
    expect(result.items.every((item) => item.status === "published" && item.featured)).toBe(true);
  });
});

describe("migration", () => {
  const sql = readFileSync(
    path.join(process.cwd(), "supabase", "migrations", "20261017120000_cms_schema.sql"),
    "utf8",
  );

  it("enables RLS, keeps writes for administrators, and does not invent settlements", () => {
    expect(sql.toLowerCase()).toContain("enable row level security");
    expect(sql).toContain("private.is_admin()");
    expect(sql.toLowerCase()).toContain("revoke insert, update, delete, truncate");
    expect(sql).toContain("site-media");
    expect(sql.toLowerCase()).not.toContain("alter table storage.objects");
    expect(sql).toContain("grant execute on function private.touch_updated_at() to authenticated");
    expect(sql).toContain("grant execute on function private.text_ok(text, integer) to authenticated");
    const followUp = readFileSync(
      path.join(process.cwd(), "supabase", "migrations", "20261017180000_grant_private_functions.sql"),
      "utf8",
    );
    expect(followUp.toLowerCase()).not.toContain("drop table");
    expect(followUp.toLowerCase()).not.toContain("create table");
    expect(followUp).toContain("grant execute on function private.text_ok(text, integer) to authenticated");
    expect(sql.toLowerCase()).not.toContain("insert into public.settlements");
    expect(sql.toLowerCase()).not.toContain("service_role");
    expect(sql.toLowerCase()).not.toContain("leaflet");
    expect(sql.toLowerCase()).not.toContain("mapbox");
  });
});
