import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { textForLanguage } from "@/lib/content-rules";
import { usePhrase, useSite } from "@/components/site-context";
import { ContactAnchor } from "@/components/contact-links";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Metsamor | COP17" },
      { name: "description", content: "Contact information for the Metsamor nature initiative (pending confirmation)." },
      { property: "og:title", content: "Contact — Metsamor | COP17" },
      { property: "og:description", content: "Contact information for the Metsamor nature initiative (pending confirmation)." },
    ],
  }),
  component: Page,
});

function Page() {
  const { t, lang } = useI18n();
  const site = useSite();
  const lead = usePhrase("contactLead", "contactLead");
  const custom = site.contactDescription ? textForLanguage(site.contactDescription, lang) : { text: "", missing: true };
  const links = site.contactLinks;
  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-semibold text-forest md:text-5xl">{t("navContact")}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{custom.text || lead}</p>
      {links.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed bg-card p-8">
          <span className="inline-flex rounded-full bg-draft px-2.5 py-0.5 text-xs font-medium text-draft-foreground">{t("contactPending")}</span>
        </div>
      ) : (
        <ul className="mt-10 grid gap-3">
          {links.map((link) => (
            <li key={link.id} className="rounded-2xl border bg-card px-5 py-4">
              <ContactAnchor link={link} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
