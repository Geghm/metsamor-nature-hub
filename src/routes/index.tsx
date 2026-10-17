import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-nature.jpg";
import { useI18n, type UIKey } from "@/lib/i18n";
import { repository } from "@/lib/repository";
import { TreasureCard } from "@/components/treasure-card";
import { Butterfly } from "@/components/site";

export const Route = createFileRoute("/")({
  loader: () => repository.listTreasures(),
  head: () => ({
    meta: [
      { title: "Metsamor — Taking Action for Nature | COP17" },
      { name: "description", content: "Discover the natural and cultural values of Metsamor Community, prepared for COP17." },
      { property: "og:title", content: "Metsamor — Taking Action for Nature | COP17" },
      { property: "og:description", content: "Discover the natural and cultural values of Metsamor Community, prepared for COP17." },
    ],
  }),
  component: Index,
});

const PILLARS: { k: UIKey; d: UIKey; color: string }[] = [
  { k: "pillar1", d: "pillar1d", color: "bg-leaf" },
  { k: "pillar2", d: "pillar2d", color: "bg-apricot" },
  { k: "pillar3", d: "pillar3d", color: "bg-lake" },
];

function Index() {
  const { t } = useI18n();
  const items = Route.useLoaderData();
  const [first, ...rest] = items;
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="" width={1600} height={912} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <Butterfly className="absolute right-[8%] top-[18%] h-16 w-20 animate-flutter opacity-90" />
        <Butterfly className="absolute right-[24%] top-[34%] hidden h-9 w-12 animate-flutter opacity-70 md:block" />
        <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-5 pb-20 text-primary-foreground">
          <p className="text-xs font-medium uppercase tracking-[0.3em] opacity-90">{t("tagline")} · COP17</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl lg:text-7xl animate-fade-up">{t("heroTitle")}</h1>
          <p className="mt-6 max-w-2xl text-base opacity-90 md:text-lg animate-fade-up" style={{ animationDelay: "0.2s" }}>{t("heroLead")}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/treasures" className="rounded-full bg-accent px-7 py-3.5 font-medium text-accent-foreground transition hover:brightness-105">{t("ctaTreasures")}</Link>
            <Link to="/settlements" className="rounded-full border border-primary-foreground/60 px-7 py-3.5 font-medium backdrop-blur transition hover:bg-primary-foreground/10">{t("ctaSettlements")}</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pt-24 md:grid-cols-3">
        {PILLARS.map((p) => (
          <div key={p.k} className="rounded-2xl border bg-card p-7">
            <span className={`block h-1.5 w-12 rounded-full ${p.color}`} />
            <h3 className="mt-5 text-xl font-semibold text-forest">{t(p.k)}</h3>
            <p className="mt-2 text-muted-foreground">{t(p.d)}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-lake">{t("featuredEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold text-forest md:text-5xl">{t("featuredTitle")}</h2>
          </div>
          <Link to="/treasures" className="text-sm font-medium text-deep hover:underline">{t("seeAll")} →</Link>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {first && <div className="lg:col-span-2"><TreasureCard treasure={first} large /></div>}
          {rest.slice(0, 4).map((x) => <TreasureCard key={x.slug} treasure={x} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24">
        <div className="relative overflow-hidden rounded-3xl bg-band px-8 py-16 text-primary-foreground md:px-16">
          <Butterfly className="absolute -right-4 -top-4 h-40 w-52 opacity-30 animate-flutter" />
          <h2 className="max-w-2xl text-3xl font-semibold md:text-4xl">{t("bandTitle")}</h2>
          <p className="mt-4 max-w-xl opacity-85">{t("settlementsLead")}</p>
          <Link to="/settlements" className="mt-8 inline-block rounded-full bg-background px-7 py-3.5 font-medium text-forest">{t("ctaSettlements")}</Link>
        </div>
      </section>
    </>
  );
}
