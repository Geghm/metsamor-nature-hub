import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { repository } from "@/lib/repository";
import { textForLanguage } from "@/lib/content-rules";
import { useI18n } from "@/lib/i18n";
import { DraftBadge } from "@/components/site";
import { CmsImage } from "@/components/cms-image";
import { usePhrase } from "@/components/site-context";

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

function Page() {
  const data = Route.useLoaderData();
  const { t, lang } = useI18n();
  const lead = usePhrase("settlementsLead", "settlementsLead");
  const [q, setQ] = useState("");
  const shown = data.items.filter((item) =>
    [item.name.hy, item.name.en, item.name.ru, item.summary.hy, item.summary.en, item.summary.ru]
      .join(" ")
      .toLowerCase()
      .includes(q.trim().toLowerCase()),
  );
  return (
    <section className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="text-4xl font-semibold text-forest md:text-5xl">{t("navSettlements")}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{lead}</p>
      {data.error && <p role="alert" className="mt-4 rounded-xl bg-draft px-4 py-3 text-sm text-draft-foreground">{t("loadError")}</p>}
      {data.items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed bg-card p-8">
          <span className="inline-flex rounded-full bg-draft px-2.5 py-0.5 text-xs font-medium text-draft-foreground">{t("placeholder")}</span>
          <p className="mt-4 text-foreground">{t("settlementsPending")}</p>
        </div>
      ) : (
        <>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} aria-label={t("search")}
            className="mt-8 w-full rounded-full border bg-card px-5 py-3 outline-none focus:ring-2 focus:ring-ring" />
          <ul className="mt-6 divide-y rounded-2xl border bg-card">
            {shown.map((item) => {
              const name = textForLanguage(item.name, lang);
              return (
                <li key={item.id}>
                  <Link to="/settlements/$slug" params={{ slug: item.slug }} className="flex items-center justify-between gap-3 px-5 py-4">
                    <div className="flex items-center gap-4">
                      {item.coverUrl && (
                        <CmsImage src={item.coverUrl} fallback={null} alt={textForLanguage(item.alt, lang).text} focalX={item.focalX} focalY={item.focalY} className="h-16 w-20 rounded-xl object-cover" />
                      )}
                      <div>
                        <p className="font-display text-xl text-forest">{name.missing ? t("missingTranslation") : name.text}</p>
                        <p className="text-xs text-muted-foreground">{t("type")}: {t(item.kind)}</p>
                      </div>
                    </div>
                    {item.status === "draft" && <DraftBadge />}
                  </Link>
                </li>
              );
            })}
            {shown.length === 0 && <li className="px-5 py-4 text-muted-foreground">{t("noResults")}</li>}
          </ul>
        </>
      )}
    </section>
  );
}
