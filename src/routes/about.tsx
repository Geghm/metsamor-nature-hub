import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Butterfly } from "@/components/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Metsamor | COP17" },
      { name: "description", content: "About the Metsamor 'Taking Action for Nature' initiative for COP17." },
      { property: "og:title", content: "About — Metsamor | COP17" },
      { property: "og:description", content: "About the Metsamor 'Taking Action for Nature' initiative for COP17." },
    ],
  }),
  component: Page,
});

function Page() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <Butterfly className="h-14 w-18" />
      <h1 className="mt-6 text-4xl font-semibold text-forest md:text-5xl">{t("navAbout")}</h1>
      <p className="mt-6 text-lg leading-relaxed">{t("aboutText")}</p>
      <p className="mt-6 text-sm text-muted-foreground">{t("aboutNote")}</p>
    </section>
  );
}
