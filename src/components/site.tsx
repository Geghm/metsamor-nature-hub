import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LANGS, useI18n } from "@/lib/i18n";
import { usePhrase, useSite } from "@/components/site-context";
import { ContactAnchor } from "@/components/contact-links";

/** Decorative butterfly motif (inspired by COP17, NOT the official logo). */
export function Butterfly({ className = "", animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 64 48" className={className} aria-hidden fill="none">
      <g className={animated ? "animate-wing" : ""}>
        <path d="M32 24 C22 4 4 4 6 18 C8 28 22 28 32 24Z" fill="var(--cop-leaf)" opacity="0.9" />
        <path d="M32 24 C42 4 60 4 58 18 C56 28 42 28 32 24Z" fill="var(--cop-turquoise)" opacity="0.9" />
        <path d="M32 24 C24 30 12 40 18 44 C24 47 30 36 32 24Z" fill="var(--cop-amber)" opacity="0.9" />
        <path d="M32 24 C40 30 52 40 46 44 C40 47 34 36 32 24Z" fill="var(--cop-deep)" opacity="0.9" />
      </g>
      <path d="M32 14 V36" stroke="var(--cop-forest)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DraftBadge() {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center rounded-full bg-draft px-2.5 py-0.5 text-xs font-medium text-draft-foreground">
      {t("draft")}
    </span>
  );
}

function useNav() {
  const { t } = useI18n();
  return [
    { to: "/", label: t("navHome") },
    { to: "/treasures", label: t("navTreasures") },
    { to: "/settlements", label: t("navSettlements") },
    { to: "/about", label: t("navAbout") },
    { to: "/contact", label: t("navContact") },
  ] as const;
}

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const nav = useNav();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Butterfly className="h-8 w-10" animated={false} />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold text-forest">{t("brand")}</span>
            <span className="block text-[11px] text-muted-foreground">{t("tagline")} · COP17</span>
          </span>
        </Link>
        <nav className="hidden gap-1 text-sm lg:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-3.5 py-2 text-muted-foreground transition hover:text-forest"
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 rounded-full border p-0.5" role="group" aria-label={t("langLabel")}>
            {LANGS.map((l) => (
              <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-forest"}`}>
                {l}
              </button>
            ))}
          </div>
          <button className="rounded-full border px-3 py-1.5 text-sm lg:hidden" aria-expanded={open} onClick={() => setOpen(!open)}>
            {t("menu")}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t px-5 py-3 lg:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: n.to === "/" }}
              className="block rounded-lg px-3 py-2.5 text-foreground"
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  const site = useSite();
  const nav = useNav();
  const footer = usePhrase("footerBody", "footer");
  const note = usePhrase("aboutNote", "aboutNote");
  const rights = usePhrase("rightsLine", "rights");
  return (
    <footer className="mt-28 bg-forest text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[2fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Butterfly className="h-10 w-12" animated={false} />
            <p className="font-display text-2xl">{t("brand")} — {t("tagline")}</p>
          </div>
          <p className="mt-4 max-w-md text-sm opacity-80">{footer}</p>
          {site.contactLinks.length > 0 && (
            <ul className="mt-4 grid gap-1 text-sm">
              {site.contactLinks.map((link) => (
                <li key={link.id}><ContactAnchor link={link} className="opacity-90 hover:underline" /></li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs opacity-60">{note}</p>
        </div>
        <ul className="grid gap-2 text-sm">
          {nav.map((n) => (
            <li key={n.to}><Link to={n.to} className="opacity-80 hover:opacity-100">{n.label}</Link></li>
          ))}
        </ul>
      </div>
      <div className="border-t border-primary-foreground/15 py-4 text-center text-xs opacity-60">COP17 · {rights}</div>
    </footer>
  );
}

export function IntroAnimation() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || localStorage.getItem("introSeen")) return;
    localStorage.setItem("introSeen", "1");
    setShow(true);
    const id = setTimeout(() => setShow(false), 3600);
    return () => clearTimeout(id);
  }, []);
  if (!show) return null;
  return (
    <div role="dialog" aria-label={t("brand")} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background animate-in fade-in">
      <Butterfly className="h-28 w-36 animate-flutter" />
      <p className="mt-8 font-display text-4xl text-forest animate-fade-up" style={{ animationDelay: "0.6s" }}>{t("brand")}</p>
      <p className="mt-2 text-muted-foreground animate-fade-up" style={{ animationDelay: "1s" }}>{t("tagline")} · COP17</p>
      <button autoFocus onClick={() => setShow(false)} className="absolute bottom-8 right-8 rounded-full border px-5 py-2 text-sm text-forest hover:bg-secondary">
        {t("skip")}
      </button>
    </div>
  );
}
