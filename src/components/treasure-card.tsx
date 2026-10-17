import { Link } from "@tanstack/react-router";
import type { Treasure } from "@/data/content";
import { IMAGES } from "@/data/images";
import { useI18n } from "@/lib/i18n";
import { DraftBadge } from "@/components/site";

export function TreasureCard({ treasure, large = false }: { treasure: Treasure; large?: boolean }) {
  const { l, t } = useI18n();
  return (
    <Link to="/treasures/$slug" params={{ slug: treasure.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition duration-500 hover:-translate-y-1">
      <div className={`relative overflow-hidden ${large ? "aspect-[4/3] md:aspect-auto md:h-96" : "aspect-[4/3]"}`}>
        <img src={IMAGES[treasure.image]} alt="" loading="lazy" width={1024} height={768}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        {treasure.status === "draft" && <div className="absolute left-4 top-4"><DraftBadge /></div>}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-lake">{l(treasure.category)}</span>
        <h3 className={`mt-2 font-semibold text-forest ${large ? "text-3xl" : "text-2xl"}`}>{l(treasure.title)}</h3>
        <p className="mt-2 flex-1 text-muted-foreground">{l(treasure.summary)}</p>
        <span className="mt-5 text-sm font-medium text-deep group-hover:underline">{t("readMore")} →</span>
      </div>
    </Link>
  );
}
