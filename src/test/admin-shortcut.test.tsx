import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminGate } from "@/components/admin/gate";
import { LanguageProvider } from "@/lib/i18n";

function press(target: EventTarget, init: KeyboardEventInit) {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

describe("admin entry", () => {
  it("opens the login dialog for Ctrl+Shift+F and Command+Shift+F", async () => {
    render(
      <LanguageProvider>
        <AdminGate />
      </LanguageProvider>,
    );
    const ctrl = press(window, { key: "f", ctrlKey: true, shiftKey: true });
    expect(ctrl.defaultPrevented).toBe(true);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("does not open while typing in a field", () => {
    render(
      <LanguageProvider>
        <AdminGate />
        <input aria-label="Search" />
      </LanguageProvider>,
    );
    const input = screen.getByLabelText("Search");
    const event = press(input, { key: "f", ctrlKey: true, shiftKey: true });
    expect(event.defaultPrevented).toBe(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
