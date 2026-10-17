import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LANGS, useI18n } from "@/lib/i18n";

export function DraftBadge() {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center rounded-full bg-draft px-2.5 py-0.5 text-xs font-medium text-draft-foreground">
      {t("draft")}
    </span>
  );
}

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const nav = [
    { to: "/", label: t("navHome") },
    { to: "/treasures", label: t("navTreasures") },
    { to: "/settlements", label: t("navSettlements") },
    { to: "/about", label: t("navAbout") },
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <Link to="/" className="leading-tight">
          <span className="block font-display text-xl font-semibold text-forest">{t("brand")}</span>
          <span className="block text-xs text-muted-foreground">{t("tagline")} · COP17</span>
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground"
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex gap-1" role="group" aria-label="Language">
          {LANGS.map((l) => (
            <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
              className={`rounded-md px-2 py-1 text-xs font-semibold uppercase ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t bg-forest text-primary-foreground">
      <div className="mx-auto max-w-6xl px-5 py-10 text-sm">
        <p className="font-display text-lg">{t("brand")} — {t("tagline")} | COP17</p>
        <p className="mt-2 opacity-80">{t("footer")}</p>
      </div>
    </footer>
  );
}

export function IntroAnimation() {
  const { t, l } = useI18n();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || sessionStorage.getItem("introSeen")) return;
    setShow(true);
    sessionStorage.setItem("introSeen", "1");
    const id = setTimeout(() => setShow(false), 3800);
    return () => clearTimeout(id);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-forest text-primary-foreground animate-in fade-in">
      <svg viewBox="0 0 200 200" className="h-40 w-40" fill="none" aria-hidden>
        <path className="animate-leaf stroke-apricot" strokeWidth="2" d="M100 180 C100 120 100 80 100 30" />
        <path className="animate-leaf stroke-sand" strokeWidth="2" style={{ animationDelay: "0.4s" }} d="M100 120 C70 110 50 85 55 60 C80 65 98 90 100 120Z" />
        <path className="animate-leaf stroke-sand" strokeWidth="2" style={{ animationDelay: "0.7s" }} d="M100 95 C130 85 150 60 145 35 C120 40 102 65 100 95Z" />
      </svg>
      <p className="mt-6 font-display text-3xl animate-fade-up" style={{ animationDelay: "1s" }}>{t("brand")}</p>
      <p className="mt-1 text-sm opacity-80 animate-fade-up" style={{ animationDelay: "1.4s" }}>{l({ hy: t("tagline"), en: t("tagline"), ru: t("tagline") })}</p>
      <button onClick={() => setShow(false)} className="absolute bottom-8 right-8 rounded-full border border-primary-foreground/40 px-4 py-2 text-sm hover:bg-primary-foreground/10">
        {t("skip")}
      </button>
    </div>
  );
}
