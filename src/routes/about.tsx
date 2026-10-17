import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

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

const TEXT = {
  hy: "«Մեծամոր — Գործենք հանուն բնության» նախաձեռնությունը ներկայացնում է համայնքի բնական ժառանգությունը ԿՕՊ17-ի համատեքստում։ Բովանդակությունը աստիճանաբար կլրացվի ստուգված տվյալներով։",
  en: "“Metsamor — Taking Action for Nature” presents the community’s natural heritage in the context of COP17. Content will be added progressively as it is verified.",
  ru: "«Мецамор — Действуем ради природы» представляет природное наследие общины в контексте COP17. Материалы будут добавляться по мере проверки.",
};

function Page() {
  const { t, l } = useI18n();
  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-semibold text-forest md:text-5xl">{t("navAbout")}</h1>
      <p className="mt-6 text-lg leading-relaxed">{l(TEXT)}</p>
    </section>
  );
}
