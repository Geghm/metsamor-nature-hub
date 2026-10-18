import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { repository } from "@/lib/repository";
import { altForLanguage, textForLanguage } from "@/lib/content-rules";
import { useI18n } from "@/lib/i18n";
import { DraftBadge } from "@/components/site";
import { IMAGES } from "@/data/images";
import { CmsImage } from "@/components/cms-image";

export const Route = createFileRoute("/treasures/$slug")({
  loader: async ({ params }) => {
    const result = await repository.getTreasure(params.slug);
    if (result.error) throw new Error("content-unavailable");
    if (!result.treasure) throw notFound();
    return result.treasure;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title.en.trim() || "Metsamor"} — Metsamor | COP17` },
          { name: "description", content: loaderData.summary.en.trim() || "Metsamor Community" },
          { property: "og:title", content: `${loaderData.title.en.trim() || "Metsamor"} — Metsamor | COP17` },
          { property: "og:description", content: loaderData.summary.en.trim() || "Metsamor Community" },
        ]
      : [{ title: "Unavailable — Metsamor" }, { name: "robots", content: "noindex" }],
  }),
  component: Page,
  notFoundComponent: Missing,
});

function Missing() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-semibold text-forest">{t("unavailable")}</h1>
      <Link to="/treasures" className="mt-6 inline-block text-sm text-lake hover:underline">{t("back")}</Link>
    </section>
  );
}

function Page() {
  const x = Route.useLoaderData();
  const { t, lang } = useI18n();
  const title = textForLanguage(x.title, lang);
  const summary = textForLanguage(x.summary, lang);
  const body = textForLanguage(x.body, lang);
  const category = textForLanguage(x.category, lang);
  const fallback = x.fallbackImage ? IMAGES[x.fallbackImage] : null;
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <CmsImage src={x.coverUrl} fallback={fallback} alt={altForLanguage(x.alt, null, lang)} focalX={x.focalX} focalY={x.focalY} width={1024} height={768} className="mb-10 aspect-[16/9] w-full rounded-2xl object-cover shadow-card" />
      <Link to="/treasures" className="text-sm text-lake hover:underline">{t("back")}</Link>
      <div className="mt-8 flex items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-lake">{category.missing ? t("missingTranslation") : category.text}</span>
        {x.status === "draft" && <DraftBadge />}
      </div>
      <h1 className="mt-3 text-4xl font-semibold text-forest md:text-6xl">{title.missing ? t("missingTranslation") : title.text}</h1>
      <p className="mt-6 text-xl text-muted-foreground">{summary.missing ? t("missingTranslation") : summary.text}</p>
      <p className="mt-6 leading-relaxed">{body.missing ? t("missingTranslation") : body.text}</p>
      {x.gallery.length > 0 && (
        <div className="mt-8 grid gap-4">
          {x.gallery.map((image) => (
            <CmsImage key={image.id} src={image.url} fallback={null} alt={altForLanguage(image.alt, null, lang)} focalX={image.focalX} focalY={image.focalY} className="aspect-[16/9] w-full rounded-2xl object-cover" />
          ))}
        </div>
      )}
      {x.sourceUrl && (
        <p className="mt-8 text-sm">
          <a href={x.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-lake hover:underline">{t("source")}</a>
        </p>
      )}
      {x.status === "draft" && <p className="mt-10 rounded-lg bg-draft p-4 text-sm text-draft-foreground">{t("draftNote")}</p>}
    </article>
  );
}
