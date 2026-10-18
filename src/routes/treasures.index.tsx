import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { repository } from "@/lib/repository";
import { textForLanguage } from "@/lib/content-rules";
import { useI18n } from "@/lib/i18n";
import { TreasureCard } from "@/components/treasure-card";
import { usePhrase, useSite } from "@/components/site-context";

export const Route = createFileRoute("/treasures/")({
  loader: () => repository.listTreasures(),
  head: () => ({
    meta: [
      { title: "Nature treasures — Metsamor | COP17" },
      { name: "description", content: "Treasure cards highlighting nature in Metsamor Community." },
      { property: "og:title", content: "Nature treasures — Metsamor | COP17" },
      { property: "og:description", content: "Treasure cards highlighting nature in Metsamor Community." },
    ],
  }),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  const site = useSite();
  const { t, lang } = useI18n();
  const lead = usePhrase("treasuresLead", "treasuresLead");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of data.items) {
      const label = textForLanguage(item.category, lang);
      map.set(item.categorySlug, label.missing ? t("missingTranslation") : label.text);
    }
    return Array.from(map, ([slug, label]) => ({ slug, label }));
  }, [data.items, lang, t]);
  const shown = data.items.filter((item) => {
    const matchesCategory = category === "all" || item.categorySlug === category;
    const haystack = [item.title.hy, item.title.en, item.title.ru, item.summary.hy, item.summary.en, item.summary.ru]
      .join(" ")
      .toLowerCase();
    return matchesCategory && haystack.includes(query.trim().toLowerCase());
  });
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <h1 className="text-4xl font-semibold text-forest md:text-5xl">{t("navTreasures")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{lead}</p>
      {site.source === "local" && <p className="mt-4 inline-block rounded-lg bg-draft px-4 py-2 text-sm text-draft-foreground">{t("draftNote")}</p>}
      {data.error && <p role="alert" className="mt-4 rounded-xl bg-draft px-4 py-3 text-sm text-draft-foreground">{t("loadError")}</p>}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchTreasures")} aria-label={t("searchTreasures")}
          className="w-full rounded-full border bg-card px-5 py-3 outline-none focus:ring-2 focus:ring-ring md:max-w-sm" />
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}
            className={`rounded-full px-3 py-1.5 text-sm ${category === "all" ? "bg-primary text-primary-foreground" : "border text-muted-foreground"}`}>
            {t("allCategories")}
          </button>
          {categories.map((item) => (
            <button key={item.slug} type="button" aria-pressed={category === item.slug} onClick={() => setCategory(item.slug)}
              className={`rounded-full px-3 py-1.5 text-sm ${category === item.slug ? "bg-primary text-primary-foreground" : "border text-muted-foreground"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {shown.map((item) => <TreasureCard key={item.slug} treasure={item} />)}
      </div>
      {shown.length === 0 && <p className="mt-8 text-muted-foreground">{t("noResults")}</p>}
    </section>
  );
}
