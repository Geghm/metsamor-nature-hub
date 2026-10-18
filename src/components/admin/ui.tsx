import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Localized, MediaAsset } from "@/lib/cms-types";
import { EMPTY_LOCALIZED } from "@/lib/cms-types";
import { uploadImage, type AdminCode } from "@/lib/admin-api";
import { adminError, adminText, type AdminTextKey } from "@/lib/admin-i18n";
import { LANGS, useI18n } from "@/lib/i18n";
import { clampFocal, validateImageFile } from "@/lib/validators";

export function useAdminText() {
  const { lang } = useI18n();
  return {
    lang,
    t: (key: AdminTextKey) => adminText(lang, key),
    e: (code: AdminCode | "saved") => adminError(lang, code),
  };
}

export const inputClass =
  "mt-1 w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
export const buttonClass =
  "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-105 disabled:opacity-50";
export const quietClass =
  "rounded-full border px-4 py-2 text-sm text-forest hover:bg-secondary disabled:opacity-50";

export function useDialogBehavior(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = Array.from(
        root.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])",
        ),
      );
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        event.stopPropagation();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        event.stopPropagation();
        first.focus();
      }
    };
    root.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);
  return ref;
}

export function DialogFrame({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useDialogBehavior(onClose);
  const titleId = useId();
  const { t } = useAdminText();
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/40 p-4">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-3xl border bg-background p-6 shadow-card outline-none ${wide ? "max-w-6xl" : "max-w-lg"}`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-display text-2xl text-forest">
            {title}
          </h2>
          <button type="button" className={quietClass} onClick={onClose}>
            {t("close")}
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function LocalizedFields({
  label,
  value,
  onChange,
  multiline = false,
  maxLength,
}: {
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  multiline?: boolean;
  maxLength: number;
}) {
  const { lang } = useI18n();
  return (
    <fieldset className="rounded-2xl border p-4">
      <legend className="px-1 text-sm font-medium text-forest">{label}</legend>
      <div className="grid gap-3">
        {LANGS.map((code) => {
          const missing = !value[code].trim();
          const id = `${label}-${code}`;
          return (
            <label key={code} htmlFor={id} className="block text-sm">
              <span className="font-semibold uppercase text-lake">{code}</span>
              {missing && <span className="ml-2 text-draft-foreground">{adminText(lang, "empty")}</span>}
              {multiline ? (
                <textarea
                  id={id}
                  value={value[code]}
                  maxLength={maxLength}
                  rows={4}
                  className={inputClass}
                  onChange={(event) => onChange({ ...value, [code]: event.target.value })}
                />
              ) : (
                <input
                  id={id}
                  value={value[code]}
                  maxLength={maxLength}
                  className={inputClass}
                  onChange={(event) => onChange({ ...value, [code]: event.target.value })}
                />
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function FocalPicker({
  src,
  alt,
  focalX,
  focalY,
  onChange,
}: {
  src: string;
  alt: string;
  focalX: number;
  focalY: number;
  onChange: (focalX: number, focalY: number) => void;
}) {
  const { t } = useAdminText();
  return (
    <div>
      <p className="text-sm text-muted-foreground">{t("focalHelp")}</p>
      <button
        type="button"
        className="relative mt-2 block aspect-video w-full overflow-hidden rounded-2xl border"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          onChange(
            clampFocal(((event.clientX - rect.left) / rect.width) * 100),
            clampFocal(((event.clientY - rect.top) / rect.height) * 100),
          );
        }}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          style={{ objectPosition: `${focalX}% ${focalY}%` }}
        />
        <span
          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-apricot"
          style={{ left: `${focalX}%`, top: `${focalY}%` }}
        />
      </button>
    </div>
  );
}

export function ImageUpload({
  onUploaded,
}: {
  onUploaded: (asset: MediaAsset) => void;
}) {
  const { t, e } = useAdminText();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function choose(next: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    if (!next) {
      setFile(null);
      setPreview(null);
      setError(null);
      return;
    }
    const valid = validateImageFile(next);
    if (!valid.ok) {
      setFile(null);
      setPreview(null);
      setError(e(valid.error));
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setError(null);
  }

  async function send() {
    if (!file) return;
    setProgress(0);
    setError(null);
    const result = await uploadImage(file, file.name, setProgress);
    setProgress(null);
    if (!result.ok) {
      setError(e(result.error));
      return;
    }
    choose(null);
    onUploaded(result.data);
  }

  return (
    <div className="rounded-2xl border border-dashed p-4">
      <label className="text-sm font-medium text-forest">
        {t("chooseFile")}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-2 block w-full text-sm"
          onChange={(event) => choose(event.target.files?.[0] ?? null)}
        />
      </label>
      {preview && (
        <div className="mt-3">
          <img src={preview} alt="" className="aspect-video w-full rounded-xl object-cover" />
          <p className="mt-2 text-sm text-muted-foreground">{t("previewReady")}</p>
          <button type="button" className={`${buttonClass} mt-3`} onClick={() => void send()} disabled={progress !== null}>
            {t("upload")}
          </button>
        </div>
      )}
      {progress !== null && (
        <div className="mt-3">
          <label className="text-xs text-muted-foreground">
            {t("progress")} {progress}%
          </label>
          <progress className="mt-1 block w-full" value={progress} max={100} />
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function ConfirmingButton({
  label,
  title,
  body,
  onConfirm,
}: {
  label: string;
  title: string;
  body: string;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useAdminText();
  const close = () => setOpen(false);
  return (
    <>
      <button type="button" className="rounded-full border border-destructive px-4 py-2 text-sm text-destructive" onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && (
        <DialogFrame title={title} onClose={close}>
          <p>{body}</p>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              className="rounded-full bg-destructive px-4 py-2 text-sm text-white"
              onClick={() => {
                setOpen(false);
                onConfirm();
              }}
            >
              {t("delete")}
            </button>
            <button type="button" className={quietClass} onClick={close}>
              {t("cancel")}
            </button>
          </div>
        </DialogFrame>
      )}
    </>
  );
}

export function blankLocalized(): Localized {
  return EMPTY_LOCALIZED();
}
