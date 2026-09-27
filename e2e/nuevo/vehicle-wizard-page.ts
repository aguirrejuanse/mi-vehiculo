import { expect, type Page } from "@playwright/test";
import { TEST_OTP_CODE } from "../helpers";

// Page object for the vehicle wizard — shared by the guest flow (/nuevo) and
// the signed-in flow (/dashboard/vehiculos/nuevo). Steps are DERIVED at
// runtime (auto/monopatin have no subtype step), so callers drive the wizard
// one step at a time rather than by index.
export class VehicleWizardPage {
  constructor(private page: Page) {}

  async gotoGuest() {
    await this.page.goto("/nuevo");
  }

  async gotoDashboard() {
    await this.page.goto("/dashboard/vehiculos/nuevo");
  }

  // OptionCardGroup renders sr-only radios inside a styled <label> — the
  // input itself is not clickable (the label's span intercepts pointer
  // events), so the click has to land on the visible card label. Scoped to
  // the visible STEP fieldset: all six steps stay mounted (`hidden` on the
  // outer .wizard-step fieldset — the nested OptionCardGroup fieldsets
  // don't carry it) and the hidden "confirmar" summary echoes the same
  // labels as exact text.
  async pickOption(label: string) {
    await this.page
      .locator("fieldset.wizard-step:not([hidden])")
      .getByText(label, { exact: true })
      .click();
  }

  async fillName(name: string) {
    await this.page.getByLabel("Nombre").fill(name);
  }

  async fillCurrentValue(value: string) {
    await this.page.getByLabel("Valor actual").fill(value);
  }

  async fillUsageRate(value: string) {
    await this.page.getByLabel(/uso semanal/i).fill(value);
  }

  async next() {
    await this.page.getByRole("button", { name: "Continuar" }).click();
  }

  async back() {
    await this.page.getByRole("button", { name: "Volver" }).click();
  }

  async confirmSave() {
    await this.page
      .getByRole("button", { name: "Confirmar y guardar" })
      .click();
  }

  async submitGuestEmail(email: string) {
    await this.page.getByLabel("Tu email").fill(email);
    await this.page.getByRole("button", { name: "Enviar código" }).click();
  }

  async submitGuestCode(code = TEST_OTP_CODE) {
    await this.page.getByLabel("Código de verificación").fill(code);
    await this.page.getByRole("button", { name: "Verificar código" }).click();
  }

  // After verifyCode the wizard auto-dispatches the pending save once Clerk's
  // session flips; if propagation lags, the action returns a retryable error
  // and the signed-in submit button appears — retry once through it.
  async waitForVehicleRedirect() {
    const arrived = await this.page
      .waitForURL(/\/dashboard\/vehiculos\/[\w-]+$/, { timeout: 30_000 })
      .then(() => true)
      .catch(() => false);
    if (!arrived) {
      await this.confirmSave();
      await this.page.waitForURL(/\/dashboard\/vehiculos\/[\w-]+$/);
    }
  }

  async expectSummaryValue(value: string) {
    await expect(this.page.getByText(value, { exact: true })).toBeVisible();
  }
}
