import { Link } from "@tanstack/react-router";
import type { PublicTreasure } from "@/lib/cms-types";
import { IMAGES } from "@/data/images";
import { altForLanguage } from "@/lib/content-rules";
import { useI18n } from "@/lib/i18n";
import { DraftBadge } from "@/components/site";
import { CmsImage } from "@/components/cms-image";

export function TreasureCard({ treasure, large = false }: { treasure: PublicTreasure; large?: boolean }) {
  const { t, lang } = useI18n();
  const title = treasure.title[lang].trim();
  const summary = treasure.summary[lang].trim();
  const category = treasure.category[lang].trim();
  const fallback = treasure.fallbackImage ? IMAGES[treasure.fallbackImage] : null;
  return (
    <Link to="/treasures/$slug" params={{ slug: treasure.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition duration-500 hover:-translate-y-1">
      <div className={`relative overflow-hidden ${large ? "aspect-[4/3] md:aspect-auto md:h-96" : "aspect-[4/3]"}`}>
        <CmsImage
          src={treasure.coverUrl}
          fallback={fallback}
          alt={altForLanguage(treasure.alt, null, lang)}
          focalX={treasure.focalX}
          focalY={treasure.focalY}
          width={1024}
          height={768}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        {treasure.status === "draft" && <div className="absolute left-4 top-4"><DraftBadge /></div>}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-lake">{category || t("missingTranslation")}</span>
        <h3 className={`mt-2 font-semibold text-forest ${large ? "text-3xl" : "text-2xl"}`}>{title || t("missingTranslation")}</h3>
        <p className="mt-2 flex-1 text-muted-foreground">{summary || t("missingTranslation")}</p>
        <span className="mt-5 text-sm font-medium text-deep group-hover:underline">{t("readMore")} →</span>
      </div>
    </Link>
  );
}
