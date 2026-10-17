import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { repository } from "@/lib/repository";
import { useI18n } from "@/lib/i18n";
import { DraftBadge } from "@/components/site";

export const Route = createFileRoute("/settlements")({
  loader: () => repository.listSettlements(),
  head: () => ({
    meta: [
      { title: "Settlements — Metsamor Community | COP17" },
      { name: "description", content: "Directory of current settlements of Metsamor Community." },
      { property: "og:title", content: "Settlements — Metsamor Community | COP17" },
      { property: "og:description", content: "Directory of current settlements of Metsamor Community." },
    ],
  }),
  component: Page,
});

const KIND = {
  town: { hy: "Քաղաք", en: "Town", ru: "Город" },
  village: { hy: "Գյուղ", en: "Village", ru: "Село" },
};

function Page() {
  const items = Route.useLoaderData();
  const { t, l } = useI18n();
  const [q, setQ] = useState("");
  const shown = items.filter((s) => Object.values(s.name).some((n) => n.toLowerCase().includes(q.toLowerCase())));
  return (
    <section className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="text-4xl font-semibold text-forest md:text-5xl">{t("navSettlements")}</h1>
      <p className="mt-3 text-muted-foreground">{t("settlementsLead")}</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")}
        className="mt-8 w-full rounded-full border bg-card px-5 py-3 outline-none focus:ring-2 focus:ring-ring" />
      <ul className="mt-6 divide-y rounded-xl border bg-card">
        {shown.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-display text-xl text-forest">{l(s.name)}</p>
              <p className="text-xs text-muted-foreground">{t("type")}: {l(KIND[s.kind])}</p>
            </div>
            {s.status === "draft" && <DraftBadge />}
          </li>
        ))}
        {shown.length === 0 && <li className="px-5 py-4 text-muted-foreground">{t("noResults")}</li>}
      </ul>
    </section>
  );
}
