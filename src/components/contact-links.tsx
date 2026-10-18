import type { ContactLink } from "@/lib/cms-types";
import { useI18n } from "@/lib/i18n";

export function ContactAnchor({ link, className = "text-forest hover:underline" }: { link: ContactLink; className?: string }) {
  const { lang } = useI18n();
  const label = link.label[lang].trim();
  if (link.kind === "email") {
    return <a className={className} href={`mailto:${link.value}`}>{label || link.value}</a>;
  }
  if (link.kind === "phone") {
    return <a className={className} href={`tel:${link.value.replace(/[^\d+]/g, "")}`}>{label || link.value}</a>;
  }
  return (
    <a className={className} href={link.value} target="_blank" rel="noopener noreferrer">
      {label || link.kind}
    </a>
  );
}
