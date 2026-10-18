import { createFileRoute, Link } from "@tanstack/react-router";
import { HERO_IMAGE } from "@/data/images";
import { useI18n } from "@/lib/i18n";
import { repository } from "@/lib/repository";
import { altForLanguage, resolveSlotImage } from "@/lib/content-rules";
import { TreasureCard } from "@/components/treasure-card";
import { Butterfly } from "@/components/site";
import { CmsImage } from "@/components/cms-image";
import { usePhrase, useSite } from "@/components/site-context";
import { SiteLink } from "@/components/site-link";

export const Route = createFileRoute("/")({
  loader: () => repository.listHomeTreasures(),
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

function Index() {
  const { t, lang } = useI18n();
  const site = useSite();
  const data = Route.useLoaderData();
  const items = data.items;
  const [first, ...rest] = items;
  const hero = resolveSlotImage(site.slots.hero, HERO_IMAGE);
  const heroAlt = altForLanguage(site.slots.hero.alt, site.slots.hero.media?.alt ?? null, lang);
  const band = resolveSlotImage(site.slots.band, null);
  const heroTitle = usePhrase("heroTitle", "heroTitle");
  const heroLead = usePhrase("heroSubtitle", "heroLead");
  const ctaTreasures = usePhrase("ctaTreasuresLabel", "ctaTreasures");
  const ctaSettlements = usePhrase("ctaSettlementsLabel", "ctaSettlements");
  const featuredEyebrow = usePhrase("featuredEyebrow", "featuredEyebrow");
  const featuredTitle = usePhrase("featuredTitle", "featuredTitle");
  const bandTitle = usePhrase("bandTitle", "bandTitle");
  const bandBody = usePhrase("bandBody", "settlementsLead");
  const treasuresHref = site.settings?.ctaTreasuresHref || "/treasures";
  const settlementsHref = site.settings?.ctaSettlementsHref || "/settlements";
  const pillars = [
    { key: "pillar1", title: usePhrase("pillar1Title", "pillar1"), body: usePhrase("pillar1Body", "pillar1d"), color: "bg-leaf" },
    { key: "pillar2", title: usePhrase("pillar2Title", "pillar2"), body: usePhrase("pillar2Body", "pillar2d"), color: "bg-apricot" },
    { key: "pillar3", title: usePhrase("pillar3Title", "pillar3"), body: usePhrase("pillar3Body", "pillar3d"), color: "bg-lake" },
  ];
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <CmsImage src={hero.src} fallback={HERO_IMAGE} alt={heroAlt} focalX={hero.focalX} focalY={hero.focalY} width={1600} height={912} loading="eager" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <Butterfly className="absolute right-[8%] top-[18%] h-16 w-20 animate-flutter opacity-90" />
        <Butterfly className="absolute right-[24%] top-[34%] hidden h-9 w-12 animate-flutter opacity-70 md:block" />
        <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-5 pb-20 text-primary-foreground">
          <p className="text-xs font-medium uppercase tracking-[0.3em] opacity-90">{t("tagline")} · COP17</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl lg:text-7xl animate-fade-up">{heroTitle}</h1>
          <p className="mt-6 max-w-2xl text-base opacity-90 md:text-lg animate-fade-up" style={{ animationDelay: "0.2s" }}>{heroLead}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <SiteLink href={treasuresHref} className="rounded-full bg-accent px-7 py-3.5 font-medium text-accent-foreground transition hover:brightness-105">{ctaTreasures}</SiteLink>
            <SiteLink href={settlementsHref} className="rounded-full border border-primary-foreground/60 px-7 py-3.5 font-medium backdrop-blur transition hover:bg-primary-foreground/10">{ctaSettlements}</SiteLink>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pt-24 md:grid-cols-3">
        {pillars.map((p) => (
          <div key={p.key} className="rounded-2xl border bg-card p-7">
            <span className={`block h-1.5 w-12 rounded-full ${p.color}`} />
            <h3 className="mt-5 text-xl font-semibold text-forest">{p.title}</h3>
            <p className="mt-2 text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-lake">{featuredEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold text-forest md:text-5xl">{featuredTitle}</h2>
          </div>
          <Link to="/treasures" className="text-sm font-medium text-deep hover:underline">{t("seeAll")} →</Link>
        </div>
        {data.error && <p role="alert" className="mt-6 rounded-xl bg-draft px-4 py-3 text-sm text-draft-foreground">{t("loadError")}</p>}
        {items.length > 0 && (
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {first && <div className="lg:col-span-2"><TreasureCard treasure={first} large /></div>}
            {rest.slice(0, 4).map((x) => <TreasureCard key={x.slug} treasure={x} />)}
          </div>
        )}
        {!data.error && items.length === 0 && site.source === "database" && (
          <div className="mt-10 rounded-2xl border border-dashed bg-card p-8 text-muted-foreground">{t("noFeatured")}</div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24">
        <div className="relative overflow-hidden rounded-3xl bg-band px-8 py-16 text-primary-foreground md:px-16">
          {band.src && <CmsImage src={band.src} fallback={null} alt="" focalX={band.focalX} focalY={band.focalY} className="absolute inset-0 h-full w-full object-cover" />}
          {band.src && <div className="absolute inset-0 bg-band opacity-80" />}
          <Butterfly className="absolute -right-4 -top-4 h-40 w-52 opacity-30 animate-flutter" />
          <div className="relative">
            <h2 className="max-w-2xl text-3xl font-semibold md:text-4xl">{bandTitle}</h2>
            <p className="mt-4 max-w-xl opacity-85">{bandBody}</p>
            <SiteLink href={settlementsHref} className="mt-8 inline-block rounded-full bg-background px-7 py-3.5 font-medium text-forest">{ctaSettlements}</SiteLink>
          </div>
        </div>
      </section>
    </>
  );
}
