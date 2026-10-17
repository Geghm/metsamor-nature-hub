import { Link } from "@tanstack/react-router";
import type { Treasure } from "@/data/content";
import { useI18n } from "@/lib/i18n";
import { DraftBadge } from "@/components/site";

export function TreasureCard({ treasure }: { treasure: Treasure }) {
  const { l } = useI18n();
  return (
    <Link to="/treasures/$slug" params={{ slug: treasure.slug }}
      className="group flex flex-col rounded-xl border bg-card p-6 shadow-card transition hover:-translate-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wider text-lake">{l(treasure.category)}</span>
        {treasure.status === "draft" && <DraftBadge />}
      </div>
      <h3 className="mt-4 text-2xl font-semibold text-forest group-hover:text-primary">{l(treasure.title)}</h3>
      <p className="mt-2 text-muted-foreground">{l(treasure.summary)}</p>
    </Link>
  );
}
