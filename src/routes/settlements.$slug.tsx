import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { repository } from "@/lib/repository";
import { altForLanguage, textForLanguage } from "@/lib/content-rules";
import { useI18n } from "@/lib/i18n";
import { DraftBadge } from "@/components/site";
import { CmsImage } from "@/components/cms-image";

export const Route = createFileRoute("/settlements/$slug")({
  loader: async ({ params }) => {
    const result = await repository.getSettlement(params.slug);
    if (result.error) throw new Error("content-unavailable");
    if (!result.settlement) throw notFound();
    return result.settlement;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name.en.trim() || "Metsamor"} — Metsamor | COP17` },
          { name: "description", content: loaderData.summary.en.trim() || "Metsamor Community" },
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
      <Link to="/settlements" className="mt-6 inline-block text-sm text-lake hover:underline">{t("settlementBack")}</Link>
    </section>
  );
}

function Page() {
  const item = Route.useLoaderData();
  const { t, lang } = useI18n();
  const name = textForLanguage(item.name, lang);
  const summary = textForLanguage(item.summary, lang);
  const body = textForLanguage(item.body, lang);
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      {item.coverUrl && (
        <CmsImage src={item.coverUrl} fallback={null} alt={altForLanguage(item.alt, null, lang)} focalX={item.focalX} focalY={item.focalY} className="mb-10 aspect-[16/9] w-full rounded-2xl object-cover shadow-card" />
      )}
      <Link to="/settlements" className="text-sm text-lake hover:underline">{t("settlementBack")}</Link>
      <div className="mt-8 flex items-center gap-3">
        <span className="text-xs uppercase tracking-wider text-lake">{t(item.kind)}</span>
        {item.status === "draft" && <DraftBadge />}
      </div>
      <h1 className="mt-3 text-4xl font-semibold text-forest md:text-6xl">{name.missing ? t("missingTranslation") : name.text}</h1>
      <p className="mt-6 text-xl text-muted-foreground">{summary.missing ? t("missingTranslation") : summary.text}</p>
      <p className="mt-6 leading-relaxed">{body.missing ? t("missingTranslation") : body.text}</p>
    </article>
  );
}
