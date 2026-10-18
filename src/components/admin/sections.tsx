import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { AdminResult } from "@/lib/admin-api";
import {
  deleteCategory,
  deleteContactLink,
  deleteMedia,
  deleteSettlement,
  deleteTreasure,
  replaceImageFile,
  saveCategory,
  saveContactDescription,
  saveContactLink,
  saveSettlement,
  saveSettings,
  saveSlot,
  saveTreasure,
  updateMediaMeta,
} from "@/lib/admin-api";
import type {
  AdminTreasure,
  AdminWorkspace,
  CategoryInput,
  ContactKind,
  ContactLinkInput,
  LibraryAsset,
  MediaAsset,
  PublicSettlement,
  SettlementInput,
  SiteSettings,
  SiteSlot,
  TreasureInput,
} from "@/lib/cms-types";
import { translationGaps } from "@/lib/translation-gaps";
import { slugify } from "@/lib/validators";
import type { AdminSection } from "@/components/admin/dashboard";
import {
  ConfirmingButton,
  FocalPicker,
  ImageUpload,
  LocalizedFields,
  blankLocalized,
  buttonClass,
  inputClass,
  quietClass,
  useAdminText,
} from "@/components/admin/ui";

export function AdminSections({
  section,
  workspace,
  commit,
}: {
  section: AdminSection;
  workspace: AdminWorkspace;
  commit: (result: AdminResult<unknown> | Promise<AdminResult<unknown>>) => Promise<boolean>;
}) {
  if (section === "overview") return <Overview workspace={workspace} />;
  if (section === "homepage") return <Homepage workspace={workspace} commit={commit} />;
  if (section === "treasures") return <Treasures workspace={workspace} commit={commit} />;
  if (section === "settlements") return <Settlements workspace={workspace} commit={commit} />;
  if (section === "categories") return <Categories workspace={workspace} commit={commit} />;
  if (section === "contact") return <Contact workspace={workspace} commit={commit} />;
  if (section === "translations") return <Translations workspace={workspace} />;
  return <Media workspace={workspace} commit={commit} />;
}

function Overview({ workspace }: { workspace: AdminWorkspace }) {
  const { t } = useAdminText();
  const gaps = translationGaps(workspace).length;
  const cards = [
    [t("publishedCount"), workspace.counts.publishedTreasures],
    [t("draftCount"), workspace.counts.draftTreasures],
    [t("featuredCount"), workspace.counts.featuredTreasures],
    [t("settlementCount"), workspace.counts.settlements],
    [t("contactCount"), workspace.counts.contactLinks],
    [t("missingCount"), gaps],
  ] as const;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(([label, value]) => (
        <article key={label} className="rounded-2xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-4xl text-forest">{value}</p>
        </article>
      ))}
    </div>
  );
}

function Homepage({
  workspace,
  commit,
}: {
  workspace: AdminWorkspace;
  commit: (result: AdminResult<unknown> | Promise<AdminResult<unknown>>) => Promise<boolean>;
}) {
  const { t } = useAdminText();
  const [settings, setSettings] = useState(workspace.settings);
  useEffect(() => setSettings(workspace.settings), [workspace.settings]);
  const fields: Array<[keyof SiteSettings, "heroTitle" | "heroSubtitle" | "ctaTreasures" | "ctaSettlements" | "featuredEyebrow" | "featuredTitle" | "pillar1" | "pillar2" | "pillar3" | "bandTitle" | "bandBody" | "aboutTitle" | "aboutBody" | "aboutNote" | "footer" | "rights" | "treasuresLead" | "settlementsLead" | "contactLead", boolean, number]> = [
    ["heroTitle", "heroTitle", false, 200],
    ["heroSubtitle", "heroSubtitle", true, 2000],
    ["ctaTreasuresLabel", "ctaTreasures", false, 120],
    ["ctaSettlementsLabel", "ctaSettlements", false, 120],
    ["featuredEyebrow", "featuredEyebrow", false, 200],
    ["featuredTitle", "featuredTitle", false, 200],
    ["pillar1Title", "pillar1", false, 200],
    ["pillar1Body", "pillar1", true, 2000],
    ["pillar2Title", "pillar2", false, 200],
    ["pillar2Body", "pillar2", true, 2000],
    ["pillar3Title", "pillar3", false, 200],
    ["pillar3Body", "pillar3", true, 2000],
    ["bandTitle", "bandTitle", false, 200],
    ["bandBody", "bandBody", true, 2000],
    ["aboutTitle", "aboutTitle", false, 200],
    ["aboutBody", "aboutBody", true, 8000],
    ["aboutNote", "aboutNote", true, 2000],
    ["footerBody", "footer", true, 2000],
    ["rightsLine", "rights", false, 200],
    ["treasuresLead", "treasuresLead", true, 2000],
    ["settlementsLead", "settlementsLead", true, 2000],
    ["contactLead", "contactLead", true, 2000],
  ];
  return (
    <div className="grid gap-8">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void commit(saveSettings(settings));
        }}
      >
        {fields.map(([key, label, multiline, max]) => {
          const value = settings[key];
          if (typeof value === "string" || value == null) return null;
          return (
            <LocalizedFields
              key={key}
              label={t(label)}
              value={value}
              maxLength={max}
              multiline={multiline}
              onChange={(next) => setSettings({ ...settings, [key]: next } as SiteSettings)}
            />
          );
        })}
        <label className="text-sm font-medium text-forest">
          {t("hrefTreasures")}
          <input className={inputClass} value={settings.ctaTreasuresHref} onChange={(event) => setSettings({ ...settings, ctaTreasuresHref: event.target.value })} />
        </label>
        <label className="text-sm font-medium text-forest">
          {t("hrefSettlements")}
          <input className={inputClass} value={settings.ctaSettlementsHref} onChange={(event) => setSettings({ ...settings, ctaSettlementsHref: event.target.value })} />
        </label>
        <button type="submit" className={buttonClass}>{t("save")}</button>
      </form>
      <SlotEditor slot={workspace.slots.hero} label={t("hero")} media={workspace.media} commit={commit} allowClear />
      <SlotEditor slot={workspace.slots.hero_secondary} label={t("heroSecondary")} note={t("secondaryNote")} media={workspace.media} commit={commit} allowClear />
      <SlotEditor slot={workspace.slots.about} label={t("aboutImage")} media={workspace.media} commit={commit} allowClear />
      <SlotEditor slot={workspace.slots.band} label={t("bandImage")} media={workspace.media} commit={commit} allowClear />
      <SlotEditor slot={workspace.slots.favicon} label={t("favicon")} media={workspace.media} commit={commit} allowClear />
    </div>
  );
}

function SlotEditor({
  slot,
  label,
  note,
  media,
  commit,
  allowClear,
}: {
  slot: SiteSlot;
  label: string;
  note?: string;
  media: LibraryAsset[];
  commit: (result: AdminResult<unknown> | Promise<AdminResult<unknown>>) => Promise<boolean>;
  allowClear: boolean;
}) {
  const { t } = useAdminText();
  const [mediaId, setMediaId] = useState<string | null>(slot.media?.id ?? null);
  const [alt, setAlt] = useState(slot.alt);
  const [focalX, setFocalX] = useState(slot.focalX);
  const [focalY, setFocalY] = useState(slot.focalY);
  const [localMedia, setLocalMedia] = useState<MediaAsset[]>([]);
  useEffect(() => {
    setMediaId(slot.media?.id ?? null);
    setAlt(slot.alt);
    setFocalX(slot.focalX);
    setFocalY(slot.focalY);
  }, [slot]);
  const options = useMemo(
    () => [...localMedia, ...media].filter((item, index, list) => list.findIndex((other) => other.id === item.id) === index),
    [localMedia, media],
  );
  const selected = options.find((item) => item.id === mediaId) ?? null;
  return (
    <form
      className="grid gap-4 rounded-3xl border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void commit(saveSlot({ key: slot.key, mediaId, alt, focalX, focalY }));
      }}
    >
      <h3 className="font-display text-2xl text-forest">{label}</h3>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
      <label className="text-sm font-medium text-forest">
        {t("fromLibrary")}
        <select className={inputClass} value={mediaId ?? ""} onChange={(event) => setMediaId(event.target.value || null)}>
          <option value="">{t("none")}</option>
          {options.map((item) => (
            <option key={item.id} value={item.id}>{item.label || item.id}</option>
          ))}
        </select>
      </label>
      <ImageUpload onUploaded={(asset) => { setLocalMedia((current) => [asset, ...current]); setMediaId(asset.id); }} />
      {selected && <FocalPicker src={selected.url} alt={selected.label} focalX={focalX} focalY={focalY} onChange={(x, y) => { setFocalX(x); setFocalY(y); }} />}
      <LocalizedFields label={t("alt")} value={alt} maxLength={300} onChange={setAlt} />
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={buttonClass}>{t("save")}</button>
        {allowClear && (
          <button type="button" className={quietClass} onClick={() => setMediaId(null)}>
            {slot.key === "hero" ? t("useBuiltin") : t("remove")}
          </button>
        )}
      </div>
    </form>
  );
}

function treasureInput(treasure?: AdminTreasure): TreasureInput {
  if (!treasure) {
    return {
      slug: "",
      categoryId: "",
      status: "draft",
      featured: false,
      sortOrder: 0,
      title: blankLocalized(),
      summary: blankLocalized(),
      body: blankLocalized(),
      alt: blankLocalized(),
      sourceUrl: "",
      coverMediaId: null,
      fallbackImage: null,
      gallery: [],
    };
  }
  return {
    id: treasure.id,
    slug: treasure.slug,
    categoryId: treasure.categoryId,
    status: treasure.status,
    featured: treasure.featured,
    sortOrder: treasure.sortOrder,
    title: treasure.title,
    summary: treasure.summary,
    body: treasure.body,
    alt: treasure.alt,
    sourceUrl: treasure.sourceUrl ?? "",
    coverMediaId: treasure.coverMediaId,
    fallbackImage: treasure.fallbackImage,
    gallery: treasure.galleryItems,
  };
}

function Treasures({
  workspace,
  commit,
}: {
  workspace: AdminWorkspace;
  commit: (result: AdminResult<unknown> | Promise<AdminResult<unknown>>) => Promise<boolean>;
}) {
  const { t, lang } = useAdminText();
  const [editing, setEditing] = useState<TreasureInput | null>(null);
  const items = workspace.treasures;
  if (!editing) {
    return (
      <div>
        <button type="button" className={buttonClass} onClick={() => setEditing(treasureInput())}>{t("newTreasure")}</button>
        <p className="mt-3 text-sm text-muted-foreground">{t("featuredHelp")}</p>
        <ul className="mt-6 divide-y rounded-2xl border bg-card">
          {items.map((item, index) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-forest">{item.title[lang] || item.slug}</p>
                <p className="text-xs text-muted-foreground">{item.status} · {item.featured ? t("featured") : t("none")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={quietClass} onClick={() => void moveTreasure(items, index, -1, commit)}>{t("up")}</button>
                <button type="button" className={quietClass} onClick={() => void moveTreasure(items, index, 1, commit)}>{t("down")}</button>
                <button type="button" className={quietClass} onClick={() => setEditing(treasureInput(item))}>{t("edit")}</button>
                <ConfirmingButton label={t("delete")} title={t("confirmDelete")} body={t("confirmDeleteBody")} onConfirm={() => void commit(deleteTreasure(item.id))} />
              </div>
            </li>
          ))}
          {items.length === 0 && <li className="px-4 py-6 text-muted-foreground">{t("empty")}</li>}
        </ul>
      </div>
    );
  }
  return <TreasureForm value={editing} workspace={workspace} onCancel={() => setEditing(null)} commit={async (result) => { const ok = await commit(result); if (ok) setEditing(null); return ok; }} />;
}

async function moveTreasure(
  items: AdminTreasure[],
  index: number,
  direction: -1 | 1,
  commit: (result: AdminResult<unknown> | Promise<AdminResult<unknown>>) => Promise<boolean>,
) {
  const current = items[index];
  const neighbor = items[index + direction];
  if (!current || !neighbor) return;
  const first = await saveTreasure({ ...treasureInput(current), sortOrder: neighbor.sortOrder });
  if (!first.ok) {
    await commit(first);
    return;
  }
  await commit(await saveTreasure({ ...treasureInput(neighbor), sortOrder: current.sortOrder }));
}

function TreasureForm({
  value,
  workspace,
  commit,
  onCancel,
}: {
  value: TreasureInput;
  workspace: AdminWorkspace;
  commit: (result: AdminResult<unknown> | Promise<AdminResult<unknown>>) => Promise<boolean>;
  onCancel: () => void;
}) {
  const { t, lang } = useAdminText();
  const [input, setInput] = useState(value);
  const missing = (["hy", "en", "ru"] as const).some((code) => !input.title[code].trim() || !input.summary[code].trim() || !input.body[code].trim());
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void commit(saveTreasure(input));
      }}
    >
      <div className="flex flex-wrap gap-2">
        <button type="button" className={quietClass} onClick={onCancel}>{t("cancel")}</button>
        <button type="submit" className={buttonClass}>{t("save")}</button>
      </div>
      <label className="text-sm font-medium text-forest">
        {t("slug")}
        <input className={inputClass} value={input.slug} onChange={(event) => setInput({ ...input, slug: event.target.value })} />
        <span className="mt-1 block text-xs text-muted-foreground">{t("slugHelp")}</span>
        <button type="button" className={`${quietClass} mt-2`} onClick={() => setInput({ ...input, slug: slugify(input.title.en) })}>{t("slug")}</button>
      </label>
      <label className="text-sm font-medium text-forest">
        {t("category")}
        <select className={inputClass} value={input.categoryId} onChange={(event) => setInput({ ...input, categoryId: event.target.value })}>
          <option value="">{t("none")}</option>
          {workspace.categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name[lang] || category.slug}</option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-forest">
        {t("status")}
        <select className={inputClass} value={input.status} onChange={(event) => setInput({ ...input, status: event.target.value as TreasureInput["status"] })}>
          <option value="draft">{t("draft")}</option>
          <option value="published">{t("published")}</option>
          <option value="archived">{t("archived")}</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-forest">
        <input type="checkbox" checked={input.featured} onChange={(event) => setInput({ ...input, featured: event.target.checked })} />
        {t("featured")}
      </label>
      <p className="text-sm text-muted-foreground">{t("featuredHelp")}</p>
      <label className="text-sm font-medium text-forest">
        {t("sortOrder")}
        <input type="number" className={inputClass} value={input.sortOrder} onChange={(event) => setInput({ ...input, sortOrder: Number(event.target.value) })} />
      </label>
      <LocalizedFields label={t("title")} value={input.title} maxLength={200} onChange={(title) => setInput({ ...input, title })} />
      <LocalizedFields label={t("summary")} value={input.summary} maxLength={600} multiline onChange={(summary) => setInput({ ...input, summary })} />
      <LocalizedFields label={t("body")} value={input.body} maxLength={8000} multiline onChange={(body) => setInput({ ...input, body })} />
      <LocalizedFields label={t("alt")} value={input.alt} maxLength={300} onChange={(alt) => setInput({ ...input, alt })} />
      <label className="text-sm font-medium text-forest">
        {t("sourceUrl")}
        <input className={inputClass} value={input.sourceUrl} onChange={(event) => setInput({ ...input, sourceUrl: event.target.value })} />
      </label>
      {missing && <p className="text-sm text-draft-foreground">{t("missingCount")}</p>}
      <h3 className="font-display text-2xl text-forest">{t("cover")}</h3>
      <MediaChooser media={workspace.media} value={input.coverMediaId} onChange={(coverMediaId) => setInput({ ...input, coverMediaId })} />
      <h3 className="font-display text-2xl text-forest">{t("gallery")}</h3>
      {input.gallery.map((item, index) => (
        <div key={`${item.mediaId}-${index}`} className="rounded-2xl border p-3">
          <MediaChooser media={workspace.media} value={item.mediaId} onChange={(mediaId) => {
            if (!mediaId) return;
            const gallery = input.gallery.map((entry, entryIndex) => entryIndex === index ? { ...entry, mediaId } : entry);
            setInput({ ...input, gallery });
          }} />
          <button type="button" className={`${quietClass} mt-2`} onClick={() => setInput({ ...input, gallery: input.gallery.filter((_, entryIndex) => entryIndex !== index) })}>{t("remove")}</button>
        </div>
      ))}
      <button type="button" className={quietClass} onClick={() => setInput({ ...input, gallery: [...input.gallery, { mediaId: "", alt: blankLocalized(), sortOrder: input.gallery.length }] })}>{t("add")}</button>
      <aside className="rounded-3xl border bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-lake">{t("preview")}</p>
        <h3 className="mt-2 text-3xl text-forest">{input.title[lang] || t("missingCount")}</h3>
        <p className="mt-2 text-muted-foreground">{input.summary[lang]}</p>
      </aside>
    </form>
  );
}

function MediaChooser({
  media,
  value,
  onChange,
}: {
  media: LibraryAsset[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const { t } = useAdminText();
  const [uploaded, setUploaded] = useState<MediaAsset[]>([]);
  const options = [...uploaded, ...media].filter((item, index, list) => list.findIndex((other) => other.id === item.id) === index);
  const selected = options.find((item) => item.id === value) ?? null;
  return (
    <div className="grid gap-3">
      <select className={inputClass} value={value ?? ""} onChange={(event) => onChange(event.target.value || null)}>
        <option value="">{t("none")}</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>{item.label || item.id}</option>
        ))}
      </select>
      <ImageUpload onUploaded={(asset) => { setUploaded((current) => [asset, ...current]); onChange(asset.id); }} />
      {selected && <img src={selected.url} alt={selected.alt.en || selected.label} className="aspect-video w-full rounded-2xl object-cover" />}
    </div>
  );
}

function Settlements({
  workspace,
  commit,
}: {
  workspace: AdminWorkspace;
  commit: (result: AdminResult<unknown> | Promise<AdminResult<unknown>>) => Promise<boolean>;
}) {
  const { t, lang } = useAdminText();
  const [editing, setEditing] = useState<SettlementInput | null>(null);
  if (!editing) {
    return (
      <div>
        <p className="rounded-2xl bg-draft p-4 text-sm text-draft-foreground">{t("settlementWarning")}</p>
        <button type="button" className={`${buttonClass} mt-4`} onClick={() => setEditing({
          slug: "",
          kind: "village",
          status: "draft",
          sortOrder: workspace.settlements.length,
          name: blankLocalized(),
          summary: blankLocalized(),
          body: blankLocalized(),
          alt: blankLocalized(),
          coverMediaId: null,
        })}>{t("newSettlement")}</button>
        <ul className="mt-6 divide-y rounded-2xl border bg-card">
          {workspace.settlements.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-forest">{item.name[lang] || item.slug}</p>
                <p className="text-xs text-muted-foreground">{item.kind} · {item.status}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className={quietClass} onClick={() => setEditing(settlementInput(item))}>{t("edit")}</button>
                <ConfirmingButton label={t("delete")} title={t("confirmDelete")} body={t("confirmDeleteBody")} onConfirm={() => void commit(deleteSettlement(item.id))} />
              </div>
            </li>
          ))}
          {workspace.settlements.length === 0 && <li className="px-4 py-6 text-muted-foreground">{t("empty")}</li>}
        </ul>
      </div>
    );
  }
  return (
    <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void commit(saveSettlement(editing)).then((saved) => { if (saved) setEditing(null); }); }}>
      <SettlementFields value={editing} media={workspace.media} onChange={setEditing} />
      <div className="flex gap-2">
        <button type="submit" className={buttonClass}>{t("save")}</button>
        <button type="button" className={quietClass} onClick={() => setEditing(null)}>{t("cancel")}</button>
      </div>
    </form>
  );
}

function settlementInput(item: PublicSettlement): SettlementInput {
  return {
    id: item.id,
    slug: item.slug,
    kind: item.kind,
    status: item.status,
    sortOrder: item.sortOrder,
    name: item.name,
    summary: item.summary,
    body: item.body,
    alt: item.alt,
    coverMediaId: item.coverMediaId,
  };
}

function SettlementFields({
  value,
  media,
  onChange,
}: {
  value: SettlementInput;
  media: LibraryAsset[];
  onChange: (value: SettlementInput) => void;
}) {
  const { t } = useAdminText();
  return (
    <>
      <label className="text-sm font-medium text-forest">{t("slug")}<input className={inputClass} value={value.slug} onChange={(event) => onChange({ ...value, slug: event.target.value })} /></label>
      <label className="text-sm font-medium text-forest">{t("kind")}
        <select className={inputClass} value={value.kind} onChange={(event) => onChange({ ...value, kind: event.target.value as SettlementInput["kind"] })}>
          <option value="town">{t("town")}</option>
          <option value="village">{t("village")}</option>
        </select>
      </label>
      <label className="text-sm font-medium text-forest">{t("status")}
        <select className={inputClass} value={value.status} onChange={(event) => onChange({ ...value, status: event.target.value as SettlementInput["status"] })}>
          <option value="draft">{t("draft")}</option>
          <option value="published">{t("published")}</option>
          <option value="archived">{t("archived")}</option>
        </select>
      </label>
      <label className="text-sm font-medium text-forest">{t("sortOrder")}<input type="number" className={inputClass} value={value.sortOrder} onChange={(event) => onChange({ ...value, sortOrder: Number(event.target.value) })} /></label>
      <LocalizedFields label={t("name")} value={value.name} maxLength={200} onChange={(name) => onChange({ ...value, name })} />
      <LocalizedFields label={t("summary")} value={value.summary} maxLength={600} multiline onChange={(summary) => onChange({ ...value, summary })} />
      <LocalizedFields label={t("body")} value={value.body} maxLength={8000} multiline onChange={(body) => onChange({ ...value, body })} />
      <LocalizedFields label={t("alt")} value={value.alt} maxLength={300} onChange={(alt) => onChange({ ...value, alt })} />
      <MediaChooser media={media} value={value.coverMediaId} onChange={(coverMediaId) => onChange({ ...value, coverMediaId })} />
    </>
  );
}

function Categories({
  workspace,
  commit,
}: {
  workspace: AdminWorkspace;
  commit: (result: AdminResult<unknown> | Promise<AdminResult<unknown>>) => Promise<boolean>;
}) {
  const { t, lang } = useAdminText();
  const [editing, setEditing] = useState<CategoryInput | null>(null);
  const [reassign, setReassign] = useState("");
  if (!editing) {
    return (
      <div>
        <button type="button" className={buttonClass} onClick={() => setEditing({ slug: "", name: blankLocalized(), description: blankLocalized(), sortOrder: workspace.categories.length })}>{t("newCategory")}</button>
        <ul className="mt-6 divide-y rounded-2xl border bg-card">
          {workspace.categories.map((item) => (
            <li key={item.id} className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_auto] md:items-center">
              <p className="font-medium text-forest">{item.name[lang] || item.slug}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={quietClass} onClick={() => setEditing({ id: item.id, slug: item.slug, name: item.name, description: item.description, sortOrder: item.sortOrder })}>{t("edit")}</button>
                <select className="rounded-full border px-3 py-2 text-sm" value={reassign} onChange={(event) => setReassign(event.target.value)} aria-label={t("reassign")}>
                  <option value="">{t("reassign")}</option>
                  {workspace.categories.filter((category) => category.id !== item.id).map((category) => (
                    <option key={category.id} value={category.id}>{category.name[lang] || category.slug}</option>
                  ))}
                </select>
                <ConfirmingButton label={t("delete")} title={t("confirmDelete")} body={t("confirmDeleteBody")} onConfirm={() => void commit(deleteCategory(item.id, reassign || undefined))} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void commit(saveCategory(editing)).then((ok) => { if (ok) setEditing(null); }); }}>
      <label className="text-sm font-medium text-forest">{t("slug")}<input className={inputClass} value={editing.slug} onChange={(event) => setEditing({ ...editing, slug: event.target.value })} /></label>
      <label className="text-sm font-medium text-forest">{t("sortOrder")}<input type="number" className={inputClass} value={editing.sortOrder} onChange={(event) => setEditing({ ...editing, sortOrder: Number(event.target.value) })} /></label>
      <LocalizedFields label={t("name")} value={editing.name} maxLength={200} onChange={(name) => setEditing({ ...editing, name })} />
      <LocalizedFields label={t("description")} value={editing.description} maxLength={2000} multiline onChange={(description) => setEditing({ ...editing, description })} />
      <div className="flex gap-2">
        <button type="submit" className={buttonClass}>{t("save")}</button>
        <button type="button" className={quietClass} onClick={() => setEditing(null)}>{t("cancel")}</button>
      </div>
    </form>
  );
}

function Contact({
  workspace,
  commit,
}: {
  workspace: AdminWorkspace;
  commit: (result: AdminResult<unknown> | Promise<AdminResult<unknown>>) => Promise<boolean>;
}) {
  const { t, lang } = useAdminText();
  const [description, setDescription] = useState(workspace.contactDescription);
  const [editing, setEditing] = useState<ContactLinkInput | null>(null);
  useEffect(() => setDescription(workspace.contactDescription), [workspace.contactDescription]);
  return (
    <div className="grid gap-6">
      <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void commit(saveContactDescription(description)); }}>
        <LocalizedFields label={t("contactDescription")} value={description} maxLength={2000} multiline onChange={setDescription} />
        <button type="submit" className={buttonClass}>{t("save")}</button>
      </form>
      {!editing && (
        <>
          <button type="button" className={quietClass} onClick={() => setEditing({ kind: "email", label: blankLocalized(), value: "", sortOrder: workspace.contactLinks.length })}>{t("newLink")}</button>
          <ul className="divide-y rounded-2xl border bg-card">
            {workspace.contactLinks.map((link) => (
              <li key={link.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <p className="text-forest">{link.label[lang] || link.kind}: {link.value}</p>
                <div className="flex gap-2">
                  <button type="button" className={quietClass} onClick={() => setEditing({ id: link.id, kind: link.kind, label: link.label, value: link.value, sortOrder: link.sortOrder })}>{t("edit")}</button>
                  <ConfirmingButton label={t("delete")} title={t("confirmDelete")} body={t("confirmDeleteBody")} onConfirm={() => void commit(deleteContactLink(link.id))} />
                </div>
              </li>
            ))}
            {workspace.contactLinks.length === 0 && <li className="px-4 py-6 text-muted-foreground">{t("empty")}</li>}
          </ul>
        </>
      )}
      {editing && (
        <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); void commit(saveContactLink(editing)).then((ok) => { if (ok) setEditing(null); }); }}>
          <label className="text-sm font-medium text-forest">{t("kind")}
            <select className={inputClass} value={editing.kind} onChange={(event) => setEditing({ ...editing, kind: event.target.value as ContactKind })}>
              <option value="email">{t("email")}</option>
              <option value="phone">{t("phone")}</option>
              <option value="instagram">{t("instagram")}</option>
              <option value="facebook">{t("facebook")}</option>
              <option value="other">{t("other")}</option>
            </select>
          </label>
          <label className="text-sm font-medium text-forest">{t("value")}<input className={inputClass} value={editing.value} onChange={(event) => setEditing({ ...editing, value: event.target.value })} /></label>
          <LocalizedFields label={t("label")} value={editing.label} maxLength={120} onChange={(label) => setEditing({ ...editing, label })} />
          <div className="flex gap-2">
            <button type="submit" className={buttonClass}>{t("save")}</button>
            <button type="button" className={quietClass} onClick={() => setEditing(null)}>{t("cancel")}</button>
          </div>
        </form>
      )}
    </div>
  );
}

function Translations({ workspace }: { workspace: AdminWorkspace }) {
  const { t } = useAdminText();
  const gaps = translationGaps(workspace);
  if (gaps.length === 0) return <p>{t("noGaps")}</p>;
  return (
    <ul className="divide-y rounded-2xl border bg-card">
      {gaps.map((gap) => (
        <li key={`${gap.section}-${gap.lang}`} className="flex justify-between px-4 py-3 text-sm">
          <span>{gap.section}</span>
          <span className="font-semibold uppercase text-draft-foreground">{gap.lang}</span>
        </li>
      ))}
    </ul>
  );
}

function Media({
  workspace,
  commit,
}: {
  workspace: AdminWorkspace;
  commit: (result: AdminResult<unknown> | Promise<AdminResult<unknown>>) => Promise<boolean>;
}) {
  const { t, lang } = useAdminText();
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [target, setTarget] = useState<LibraryAsset | null>(null);
  const shown = workspace.media.filter((item) => `${item.label} ${item.storagePath}`.toLowerCase().includes(query.toLowerCase()));

  function chooseReplacement(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreview(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-foreground">{t("libraryHelp")}</p>
      <ImageUpload onUploaded={() => void commit({ ok: true, data: true })} />
      <label className="text-sm font-medium text-forest">{t("searchMedia")}
        <input className={inputClass} value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        {shown.map((item) => (
          <article key={item.id} className="rounded-2xl border bg-card p-4">
            <img src={item.url} alt={item.alt[lang] || ""} className="aspect-video w-full rounded-xl object-cover" />
            <p className="mt-3 font-medium text-forest">{item.label || item.id}</p>
            <p className="text-xs text-muted-foreground">{item.usages.length ? `${t("inUse")}: ${item.usages.map((usage) => `${usage.kind} ${usage.label}`).join(", ")}` : t("unused")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={quietClass} onClick={() => { setTarget(item); chooseReplacement(null); }}>{t("replace")}</button>
              <ConfirmingButton
                label={t("delete")}
                title={t("confirmDelete")}
                body={item.usages.length ? t("inUse") : t("confirmDeleteBody")}
                onConfirm={() => void commit(deleteMedia(item.id))}
              />
            </div>
            <form className="mt-3 grid gap-2" onSubmit={(event) => { event.preventDefault(); void commit(updateMediaMeta(item.id, item.label, item.alt, item.focalX, item.focalY)); }}>
              <AssignSlot asset={item} commit={commit} />
            </form>
          </article>
        ))}
      </div>
      {target && (
        <form
          className="rounded-3xl border p-4"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            if (!preview) return;
            setProgress(0);
            void replaceImageFile(target.id, preview, setProgress).then((result) => {
              setProgress(null);
              if (result.ok) chooseReplacement(null);
              void commit(result);
            });
          }}
        >
          <h3 className="font-display text-2xl text-forest">{t("replace")}</h3>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-3 block" onChange={(event) => chooseReplacement(event.target.files?.[0] ?? null)} />
          {previewUrl && <img src={previewUrl} alt="" className="mt-3 aspect-video w-full rounded-xl object-cover" />}
          {progress !== null && <progress className="mt-3 w-full" value={progress} max={100} />}
          <div className="mt-3 flex gap-2">
            <button type="submit" className={buttonClass} disabled={!preview || progress !== null}>{t("save")}</button>
            <button type="button" className={quietClass} onClick={() => setTarget(null)}>{t("cancel")}</button>
          </div>
        </form>
      )}
    </div>
  );
}

function AssignSlot({
  asset,
  commit,
}: {
  asset: LibraryAsset;
  commit: (result: AdminResult<unknown> | Promise<AdminResult<unknown>>) => Promise<boolean>;
}) {
  const { t } = useAdminText();
  return (
    <label className="text-sm font-medium text-forest">
      {t("assign")}
      <select
        className={inputClass}
        defaultValue=""
        onChange={(event) => {
          const key = event.target.value as SiteSlot["key"] | "";
          if (!key) return;
          void commit(saveSlot({ key, mediaId: asset.id, alt: asset.alt, focalX: asset.focalX, focalY: asset.focalY }));
          event.target.value = "";
        }}
      >
        <option value="">{t("assign")}</option>
        <option value="hero">{t("hero")}</option>
        <option value="hero_secondary">{t("heroSecondary")}</option>
        <option value="about">{t("aboutImage")}</option>
        <option value="band">{t("bandImage")}</option>
        <option value="favicon">{t("favicon")}</option>
      </select>
    </label>
  );
}
