import { createFileRoute } from "@tanstack/react-router";
import { repository } from "@/lib/repository";
import { useI18n } from "@/lib/i18n";
import { TreasureCard } from "@/components/treasure-card";

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
  const items = Route.useLoaderData();
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <h1 className="text-4xl font-semibold text-forest md:text-5xl">{t("navTreasures")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t("treasuresLead")}</p>
      <p className="mt-4 inline-block rounded-lg bg-draft px-4 py-2 text-sm text-draft-foreground">{t("draftNote")}</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((x) => <TreasureCard key={x.slug} treasure={x} />)}
      </div>
    </section>
  );
}
