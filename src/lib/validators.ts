export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type ValidationCode =
  | "required"
  | "too_long"
  | "bad_url"
  | "bad_email"
  | "bad_phone"
  | "bad_slug"
  | "bad_file_type"
  | "bad_file_size"
  | "bad_image"
  | "bad_path";

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: ValidationCode };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function normalizeSlug(input: string): ValidationResult<string> {
  const value = slugify(input.trim());
  if (!value || !SLUG.test(value)) return { ok: false, error: "bad_slug" };
  return { ok: true, value };
}

export function normalizeExternalUrl(input: string): ValidationResult<string> {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "bad_url" };
  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return { ok: false, error: "bad_url" };
  }
  if (parsed.username || parsed.password) return { ok: false, error: "bad_url" };
  if (parsed.protocol === "http:") parsed.protocol = "https:";
  if (parsed.protocol !== "https:") return { ok: false, error: "bad_url" };
  if (!parsed.hostname.includes(".")) return { ok: false, error: "bad_url" };
  const value = parsed.toString();
  if (value.length > 500) return { ok: false, error: "too_long" };
  return { ok: true, value };
}

export function normalizeEmail(input: string): ValidationResult<string> {
  const value = input.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 200) {
    return { ok: false, error: "bad_email" };
  }
  return { ok: true, value };
}

export function normalizePhone(input: string): ValidationResult<string> {
  const value = input.trim().replace(/\s+/g, " ");
  const digits = value.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 15 || !/^\+?[0-9][0-9 ()-]{5,24}$/.test(value)) {
    return { ok: false, error: "bad_phone" };
  }
  return { ok: true, value };
}

export function normalizeInternalPath(input: string): ValidationResult<string> {
  const value = input.trim();
  if (!/^\/[a-z0-9/-]*$/.test(value) || value.includes("//")) {
    return { ok: false, error: "bad_path" };
  }
  return { ok: true, value };
}

export function extensionForImage(file: { name: string; type: string }): string | null {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  const match = /\.(jpe?g|png|webp)$/i.exec(file.name);
  if (!match) return null;
  const ext = match[1]?.toLowerCase();
  if (ext === "jpeg" || ext === "jpg") return "jpg";
  if (ext === "png" || ext === "webp") return ext;
  return null;
}

export function validateImageFile(file: {
  name: string;
  type: string;
  size: number;
}): ValidationResult<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { ok: false, error: "bad_file_type" };
  }
  if (!extensionForImage(file)) return { ok: false, error: "bad_file_type" };
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) return { ok: false, error: "bad_file_size" };
  return { ok: true, value: extensionForImage(file) ?? "jpg" };
}

export function clampFocal(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, Math.round(value * 100) / 100));
}

export function limitText(input: string, max: number): ValidationResult<string> {
  const value = input.replace(/\r\n/g, "\n");
  if (value.length > max) return { ok: false, error: "too_long" };
  return { ok: true, value };
}
