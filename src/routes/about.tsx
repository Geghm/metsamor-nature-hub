import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { altForLanguage, resolveSlotImage } from "@/lib/content-rules";
import { Butterfly } from "@/components/site";
import { CmsImage } from "@/components/cms-image";
import { usePhrase, useSite } from "@/components/site-context";

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
  const { t, lang } = useI18n();
  const site = useSite();
  const title = usePhrase("aboutTitle", "navAbout");
  const body = usePhrase("aboutBody", "aboutText");
  const note = usePhrase("aboutNote", "aboutNote");
  const image = resolveSlotImage(site.slots.about, null);
  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <Butterfly className="h-14 w-18" />
      {image.src && (
        <CmsImage
          src={image.src}
          fallback={null}
          alt={altForLanguage(site.slots.about.alt, site.slots.about.media?.alt ?? null, lang)}
          focalX={image.focalX}
          focalY={image.focalY}
          className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover shadow-card"
        />
      )}
      <h1 className="mt-6 text-4xl font-semibold text-forest md:text-5xl">{title}</h1>
      <p className="mt-6 text-lg leading-relaxed">{body}</p>
      <p className="mt-6 text-sm text-muted-foreground">{note}</p>
    </section>
  );
}
