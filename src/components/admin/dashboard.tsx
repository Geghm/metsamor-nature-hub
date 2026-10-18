import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { loadAdminWorkspace, signOutAdmin, type AdminResult } from "@/lib/admin-api";
import type { AdminWorkspace } from "@/lib/cms-types";
import { adminError } from "@/lib/admin-i18n";
import { useI18n } from "@/lib/i18n";
import { Butterfly } from "@/components/site";
import { AdminSections } from "@/components/admin/sections";
import { quietClass, useAdminText, useDialogBehavior } from "@/components/admin/ui";

const SECTIONS = [
  "overview",
  "homepage",
  "treasures",
  "settlements",
  "categories",
  "contact",
  "translations",
  "media",
] as const;

export type AdminSection = (typeof SECTIONS)[number];

export function Dashboard({ onClose }: { onClose: () => void }) {
  const { lang } = useI18n();
  const { t } = useAdminText();
  const router = useRouter();
  const ref = useDialogBehavior(onClose);
  const [section, setSection] = useState<AdminSection>("overview");
  const [workspace, setWorkspace] = useState<AdminWorkspace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const result = await loadAdminWorkspace();
    setLoading(false);
    if (!result.ok) {
      setWorkspace(null);
      setError(adminError(lang, result.error));
      if (result.error === "expired" || result.error === "not_admin" || result.error === "forbidden") onClose();
      return;
    }
    setError(null);
    setWorkspace(result.data);
  }, [lang, onClose]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function commit(pending: AdminResult<unknown> | Promise<AdminResult<unknown>>): Promise<boolean> {
    const result = await pending;
    if (!result.ok) {
      setNotice(adminError(lang, result.error));
      if (result.error === "expired") onClose();
      return false;
    }
    setNotice(adminError(lang, "saved"));
    await reload();
    await router.invalidate();
    return true;
  }

  async function logout() {
    await signOutAdmin();
    onClose();
  }

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="admin-dashboard-title" tabIndex={-1} className="fixed inset-0 z-[80] flex bg-background text-foreground outline-none">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card p-5 md:flex">
        <div className="flex items-center gap-2">
          <Butterfly className="h-8 w-10" animated={false} />
          <p id="admin-dashboard-title" className="font-display text-lg text-forest">
            {t("dashboard")}
          </p>
        </div>
        <nav className="mt-6 grid gap-1" aria-label={t("dashboard")}>
          {SECTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSection(item)}
              className={`rounded-full px-3 py-2 text-left text-sm ${section === item ? "bg-secondary text-forest" : "text-muted-foreground hover:text-forest"}`}
            >
              {t(item)}
            </button>
          ))}
        </nav>
        <button type="button" className={`${quietClass} mt-auto`} onClick={() => void logout()}>
          {t("logout")}
        </button>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <label className="text-sm md:hidden">
            <span className="sr-only">{t("dashboard")}</span>
            <select className="rounded-full border bg-card px-3 py-2" value={section} onChange={(event) => setSection(event.target.value as AdminSection)}>
              {SECTIONS.map((item) => (
                <option key={item} value={item}>
                  {t(item)}
                </option>
              ))}
            </select>
          </label>
          <p className="hidden font-display text-2xl text-forest md:block">{t(section)}</p>
          <div className="flex gap-2">
            <button type="button" className={`${quietClass} md:hidden`} onClick={() => void logout()}>
              {t("logout")}
            </button>
            <button type="button" className={quietClass} onClick={onClose}>
              {t("close")}
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {notice && (
            <p role="status" className="mb-4 rounded-xl bg-secondary px-4 py-3 text-sm text-forest">
              {notice}
            </p>
          )}
          {error && (
            <div role="alert" className="mb-4 rounded-xl bg-draft px-4 py-3 text-sm text-draft-foreground">
              <p>{error}</p>
              <button type="button" className={`${quietClass} mt-3`} onClick={() => void reload()}>
                {t("retry")}
              </button>
            </div>
          )}
          {loading && !workspace && <p>{t("loading")}</p>}
          {workspace && <AdminSections section={section} workspace={workspace} commit={commit} />}
        </div>
      </div>
    </div>
  );
}
