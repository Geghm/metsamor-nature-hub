import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-nature.jpg";
import { useI18n } from "@/lib/i18n";
import { TREASURES } from "@/data/content";
import { TreasureCard } from "@/components/treasure-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Metsamor — Taking Action for Nature | COP17" },
      { name: "description", content: "Discover the nature treasures of Metsamor Community, prepared for COP17." },
      { property: "og:title", content: "Metsamor — Taking Action for Nature | COP17" },
      { property: "og:description", content: "Discover the nature treasures of Metsamor Community, prepared for COP17." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="" width={1600} height={912} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <div className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-5 pb-16 text-primary-foreground">
          <p className="text-sm uppercase tracking-[0.2em] opacity-90">COP17</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-semibold md:text-7xl animate-fade-up">{t("tagline")}</h1>
          <p className="mt-5 max-w-xl text-lg opacity-90">{t("heroLead")}</p>
          <Link to="/treasures" className="mt-8 w-fit rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground hover:opacity-90">
            {t("explore")}
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 pt-20">
        <h2 className="text-3xl font-semibold text-forest">{t("navTreasures")}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {TREASURES.map((x) => <TreasureCard key={x.slug} treasure={x} />)}
        </div>
      </section>
    </>
  );
}
