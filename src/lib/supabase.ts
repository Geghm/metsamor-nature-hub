import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseConfigState = "ready" | "missing" | "invalid";

let browserClient: SupabaseClient | null = null;
let publicClient: SupabaseClient | null = null;

function readEnv(): { url: string; key: string } {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";
  return { url, key };
}

/** Reject service-role and secret keys before they can reach the browser client. */
export function isUnsafeSupabaseKey(key: string): boolean {
  const trimmed = key.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("sb_secret_") || trimmed.includes("service_role")) return true;
  const parts = trimmed.split(".");
  if (parts.length !== 3 || !parts[1]) return false;
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(padded)) as { role?: string };
    return json.role === "service_role";
  } catch {
    return false;
  }
}

export function supabaseConfigState(): SupabaseConfigState {
  const { url, key } = readEnv();
  if (!url && !key) return "missing";
  if (!url || !key || isUnsafeSupabaseKey(key)) return "invalid";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "invalid";
  } catch {
    return "invalid";
  }
  return "ready";
}

export function supabaseUrl(): string {
  return readEnv().url.replace(/\/$/, "");
}

export function supabaseAnonKey(): string {
  return readEnv().key;
}

function create(persist: boolean): SupabaseClient {
  const { url, key } = readEnv();
  if (supabaseConfigState() !== "ready") {
    throw new Error("Supabase is not configured");
  }
  return createClient(url, key, {
    auth: {
      persistSession: persist,
      autoRefreshToken: persist,
      detectSessionInUrl: false,
    },
  });
}

/** Anonymous client used for public reads. It never stores an admin session. */
export function getPublicSupabase(): SupabaseClient {
  if (!publicClient) publicClient = create(false);
  return publicClient;
}

/** Browser client used for administrator sign-in and writes. */
export function getBrowserSupabase(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("Admin authentication is only available in the browser");
  }
  if (!browserClient) browserClient = create(true);
  return browserClient;
}

export function mediaPublicUrl(storagePath: string, version: string): string {
  const encoded = storagePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${supabaseUrl()}/storage/v1/object/public/site-media/${encoded}?v=${encodeURIComponent(version)}`;
}
