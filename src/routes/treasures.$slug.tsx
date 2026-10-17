import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { repository } from "@/lib/repository";
import { useI18n } from "@/lib/i18n";
import { DraftBadge } from "@/components/site";
import { IMAGES } from "@/data/images";

export const Route = createFileRoute("/treasures/$slug")({
  loader: async ({ params }) => {
    const t = await repository.getTreasure(params.slug);
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title.en} — Metsamor | COP17` },
          { name: "description", content: loaderData.summary.en },
          { property: "og:title", content: `${loaderData.title.en} — Metsamor | COP17` },
          { property: "og:description", content: loaderData.summary.en },
        ]
      : [{ title: "Unavailable — Metsamor" }, { name: "robots", content: "noindex" }],
  }),
  component: Page,
});

function Page() {
  const x = Route.useLoaderData();
  const { l, t } = useI18n();
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <img src={IMAGES[x.image]} alt="" width={1024} height={768} className="mb-10 aspect-[16/9] w-full rounded-2xl object-cover shadow-card" />
      <Link to="/treasures" className="text-sm text-lake hover:underline">{t("back")}</Link>
      <div className="mt-8 flex items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-lake">{l(x.category)}</span>
        {x.status === "draft" && <DraftBadge />}
      </div>
      <h1 className="mt-3 text-4xl font-semibold text-forest md:text-6xl">{l(x.title)}</h1>
      <p className="mt-6 text-xl text-muted-foreground">{l(x.summary)}</p>
      <p className="mt-6 leading-relaxed">{l(x.body)}</p>
      {x.status === "draft" && <p className="mt-10 rounded-lg bg-draft p-4 text-sm text-draft-foreground">{t("draftNote")}</p>}
    </article>
  );
}
