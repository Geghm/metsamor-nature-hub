import { useCallback, useEffect, useState, type FormEvent } from "react";
import { peekAdmin, signInAdmin, signOutAdmin, type AdminCode } from "@/lib/admin-api";
import { isAdminShortcut, isEditableEventTarget } from "@/lib/shortcut";
import { Dashboard } from "@/components/admin/dashboard";
import { DialogFrame, buttonClass, inputClass, useAdminText } from "@/components/admin/ui";

type Mode = "closed" | "checking" | "login" | "dashboard";

export function AdminGate() {
  const [mode, setMode] = useState<Mode>("closed");
  const [request, setRequest] = useState(0);
  const [loginError, setLoginError] = useState<AdminCode | null>(null);
  const close = useCallback(() => setMode("closed"), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!isAdminShortcut(event) || isEditableEventTarget(event.target)) return;
      event.preventDefault();
      setRequest((value) => value + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (request === 0) return;
    setMode("checking");
    let cancelled = false;
    void (async () => {
      const status = await peekAdmin();
      if (cancelled) return;
      if (status === "admin") {
        setLoginError(null);
        setMode("dashboard");
        return;
      }
      if (status === "forbidden") {
        await signOutAdmin();
        setLoginError("not_admin");
      } else if (status === "anonymous") {
        setLoginError(null);
      } else {
        setLoginError(status);
      }
      setMode("login");
    })();
    return () => {
      cancelled = true;
    };
  }, [request]);

  if (mode === "closed") return null;
  if (mode === "dashboard") return <Dashboard onClose={close} />;
  return <LoginDialog error={loginError} checking={mode === "checking"} onClose={close} onSuccess={() => setMode("dashboard")} />;
}

function LoginDialog({
  error,
  checking,
  onClose,
  onSuccess,
}: {
  error: AdminCode | null;
  checking: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t, e } = useAdminText();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<AdminCode | null>(error);
  const message = localError ?? error;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await signInAdmin(email, password);
    setPending(false);
    if (!result.ok) {
      setLocalError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <DialogFrame title={t("loginTitle")} onClose={onClose}>
      <p className="text-sm text-muted-foreground">{checking ? t("checking") : t("loginHelp")}</p>
      <form className="mt-4 grid gap-3" onSubmit={(event) => void submit(event)}>
        <label className="text-sm font-medium text-forest" htmlFor="admin-email">
          {t("email")}
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            autoFocus
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            aria-invalid={message === "invalid_login"}
          />
        </label>
        <label className="text-sm font-medium text-forest" htmlFor="admin-password">
          {t("password")}
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            aria-invalid={message === "invalid_login"}
          />
        </label>
        {message && (
          <p id="admin-login-error" role="alert" className="text-sm text-destructive">
            {e(message)}
          </p>
        )}
        <button type="submit" className={buttonClass} disabled={pending || checking}>
          {t("signIn")}
        </button>
      </form>
    </DialogFrame>
  );
}
