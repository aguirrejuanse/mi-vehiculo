import type { Locator, Page } from "@playwright/test";
import {
  deleteVehicleById,
  sectionByHeading,
  signInSeededUser,
} from "../helpers";
import { VehicleWizardPage } from "../nuevo/vehicle-wizard-page";
import { expect, test } from "../fixtures";

test.beforeEach(async ({ page }) => {
  await signInSeededUser(page);
});

// Mutations run serially against vehicles created by the suite itself — a
// retried submit would double-insert a plan, so same rule as crud.spec.ts.
test.describe.configure({ mode: "serial", retries: 0 });

function vehiclePathFrom(url: string): string {
  const pathname = new URL(url).pathname;
  // Exclude /vehiculos/nuevo — it would otherwise match [\w-]+ as an "id".
  const match = pathname.match(
    /\/dashboard\/vehiculos\/(?!nuevo(?:\/|$))[\w-]+/,
  );
  if (!match) throw new Error(`unexpected vehicle URL: ${url}`);
  return match[0];
}

// Each checklist row is a <li> whose label carries the name in its own span —
// exact-match on the name so two rows that share a substring can never both
// resolve here (strict mode).
function planRow(page: Page, name: string): Locator {
  return page
    .locator("li")
    .filter({ has: page.getByText(name, { exact: true }) });
}

test.describe("suggested maintenance plan", { tag: "@e2e" }, () => {
  const createdVehiclePaths: string[] = [];
  let appliedVehiclePath: string;
  let appliedVehicleName: string;

  test.afterAll(async () => {
    for (const path of createdVehiclePaths) {
      await deleteVehicleById(path.split("/").pop()!);
    }
  });

  // tipo → subtipo → motor → apodo → estado → uso → confirmar, then land
  // on /listo. The engine pick matters: rows like "Aceite de caja" are
  // 2t-only in the catalog.
  async function createEnduro(
    page: Page,
    name: string,
    unitLabel: "Horas" | "Kilómetros",
  ) {
    const wizard = new VehicleWizardPage(page);
    await wizard.gotoDashboard();
    await wizard.pickOption("Moto");
    await wizard.next();
    await wizard.pickOption("Enduro/MX");
    await wizard.next();
    await wizard.pickOption("2 tiempos");
    await wizard.next();
    await wizard.fillName(name);
    await wizard.next();
    await wizard.pickOption(unitLabel);
    await wizard.fillCurrentValue("100");
    await wizard.next();
    await wizard.fillUsageRate("5");
    await wizard.next();
    await wizard.confirmSave();
    await wizard.waitForVehicleRedirect();
    createdVehiclePaths.push(vehiclePathFrom(page.url()));
  }

  test("the enduro plan is offered all-checked and only checked rows are created", async ({
    page,
  }) => {
    appliedVehicleName = `Enduro E2E ${Date.now()}`;
    await createEnduro(page, appliedVehicleName, "Horas");
    appliedVehiclePath = vehiclePathFrom(page.url());

    await expect(page).toHaveURL(new RegExp(`${appliedVehiclePath}/listo$`));
    await expect(
      page.getByRole("heading", { name: /Tu vehículo está/ }),
    ).toBeVisible();

    // The plan is opt-out: every row starts checked and the submit carries
    // the count (don't pin the number — the catalog grows).
    const checkboxes = page.getByRole("checkbox");
    for (const checkbox of await checkboxes.all()) {
      await expect(checkbox).toBeChecked();
    }
    const submit = page.getByRole("button", {
      name: /Agregar \d+ mantenimientos/,
    });
    await expect(submit).toBeVisible();

    // Drop one usage-based row and one interval-less row.
    await planRow(page, "Aceite de caja").getByRole("checkbox").uncheck();
    await planRow(page, "Lavado general").getByRole("checkbox").uncheck();

    await submit.click();
    await page.waitForURL(appliedVehiclePath);

    const tipos = sectionByHeading(page, "Tipos de mantenimiento");
    await expect(tipos.getByText("Filtro de aire")).toBeVisible();
    await expect(
      tipos.getByText("Aceite de caja"),
    ).not.toBeVisible();
    await expect(tipos.getByText("Lavado general")).not.toBeVisible();
  });

  test("/listo redirects to the vehicle once it has types — no plan can double-apply", async ({
    page,
  }) => {
    await page.goto(`${appliedVehiclePath}/listo`);
    await page.waitForURL(appliedVehiclePath);
    await expect(
      page.getByRole("heading", { name: appliedVehicleName }),
    ).toBeVisible();
  });

  test("an enduro tracked in km only gets calendar and interval-less rows", async ({
    page,
  }) => {
    const vehicleName = `Enduro km E2E ${Date.now()}`;
    await createEnduro(page, vehicleName, "Kilómetros");
    const vehiclePath = vehiclePathFrom(page.url());

    await expect(page).toHaveURL(new RegExp(`${vehiclePath}/listo$`));
    // Hour-based catalog intervals would be nonsense in km — only the
    // calendar and no-interval rows survive the unit filter.
    await expect(planRow(page, "Líquido de frenos")).toBeVisible();
    await expect(planRow(page, "Líquido refrigerante")).toBeVisible();
    await expect(planRow(page, "Lavado general")).toBeVisible();
    await expect(planRow(page, "Aceite de caja")).toHaveCount(0);
    await expect(planRow(page, "Kit de transmisión")).toHaveCount(0);

    // "Ahora no" skips the plan entirely.
    await page.getByRole("link", { name: "Ahora no" }).click();
    await page.waitForURL(vehiclePath);
    await expect(
      page.getByRole("heading", { name: vehicleName }),
    ).toBeVisible();
    const tipos = sectionByHeading(page, "Tipos de mantenimiento");
    await expect(
      tipos.getByRole("button", { name: "Archivar" }),
    ).toHaveCount(0);
  });
});
