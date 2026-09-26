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

// Mutations run serially against a vehicle created by the suite itself, so
// the seeded garage stays pristine for the read-only dashboard specs running
// in parallel. Retries are off: a post-commit flake would retry a mutation
// and create duplicate entities, which strict-mode assertions can never
// survive — one clean failure beats a poisoned chain.
test.describe.configure({ mode: "serial", retries: 0 });

test.describe("vehicle crud", { tag: "@e2e" }, () => {
  let vehiclePath: string;

  // Whatever the chain managed to create gets deleted — otherwise a killed
  // run leaves "Renault 12 E2E" in the seeded garage until the next reseed.
  test.afterAll(async () => {
    const vehicleId = vehiclePath?.split("/").pop();
    if (vehicleId) await deleteVehicleById(vehicleId);
  });

  test("a signed-in user creates a vehicle through the wizard", async ({
    page,
  }) => {
    const wizard = new VehicleWizardPage(page);
    await wizard.gotoDashboard();

    // tipo — auto has no subtypes, so the wizard skips that step.
    await wizard.pickOption("Auto/Camioneta");
    await wizard.next();

    // apodo
    await wizard.fillName("Renault 12 E2E");
    await wizard.next();

    // estado — without a subtype preset, the unit must be picked manually.
    await wizard.pickOption("Kilómetros");
    await wizard.fillCurrentValue("42000");
    await wizard.next();

    // uso
    await wizard.fillUsageRate("300");
    await wizard.next();

    // confirmar — signed-in users submit straight away (no email capture).
    await wizard.expectSummaryValue("Renault 12 E2E");
    await wizard.confirmSave();

    // autos have a catalog-backed plan → the redirect lands on /listo;
    // this spec asserts the detail page, so skip it before capturing the URL.
    await wizard.waitForVehicleRedirect();
    await wizard.skipSuggestedPlan();
    await expect(
      page.getByRole("heading", { name: "Renault 12 E2E" }),
    ).toBeVisible();
    vehiclePath = new URL(page.url()).pathname;
    await expect(page.getByText("Auto", { exact: true })).toBeVisible();
    // The header metric: value and unit in sibling spans of one <p> (no
    // joining whitespace node, hence the flexible regex).
    const metric = page
      .locator("p")
      .filter({ has: page.getByText("42.000", { exact: true }) });
    await expect(metric).toContainText(/42\.000\s*km/);
  });

  test("adds a maintenance type with an interval", async ({ page }) => {
    await page.goto(vehiclePath);

    await page
      .getByRole("link", { name: "Nuevo mantenimiento" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/mantenimientos\/nuevo/);

    await page.getByLabel("Nombre").fill("Cambio aceite E2E");
    await page.getByLabel(/intervalo por uso/i).fill("5000");
    await page
      .getByRole("button", { name: "Guardar mantenimiento" })
      .click();

    await page.waitForURL(vehiclePath);

    // The new type shows up in the management list and in "Próximos" as
    // "Sin registro" until its first log.
    const tipos = sectionByHeading(page, "Tipos de mantenimiento");
    await expect(tipos.getByText("Cambio aceite E2E")).toBeVisible();

    const proximos = sectionByHeading(page, "Próximos mantenimientos");
    await expect(proximos.getByText("Cambio aceite E2E")).toBeVisible();
    await expect(proximos.getByText("Sin registro")).toBeVisible();
  });

  test("adds a maintenance log for that type", async ({ page }) => {
    await page.goto(vehiclePath);

    await page.getByRole("link", { name: "Nuevo registro" }).click();
    await expect(page).toHaveURL(/\/registros\/nuevo/);

    await page
      .getByLabel("Mantenimiento realizado")
      .selectOption({ label: "Cambio aceite E2E" });
    await page.getByLabel(/valor al momento/i).fill("41000");
    await page
      .getByRole("button", { name: "Guardar registro" })
      .click();

    await page.waitForURL(vehiclePath);

    const historial = sectionByHeading(page, "Historial");
    await expect(historial.getByText("Cambio aceite E2E")).toBeVisible();
    await expect(historial.getByText("41.000 km")).toBeVisible();

    // With one log at 41.000 km and a 5.000 km interval, next-due is 46.000.
    const proximos = sectionByHeading(page, "Próximos mantenimientos");
    await expect(proximos.getByText("Al día")).toBeVisible();
  });

  test("adds a part and advances its status", async ({ page }) => {
    await page.goto(vehiclePath);

    await page.getByRole("link", { name: "Nuevo repuesto" }).click();
    await expect(page).toHaveURL(/\/repuestos\/nuevo/);

    await page.getByLabel("Nombre").fill("Filtro E2E");
    await page
      .getByRole("button", { name: "Guardar repuesto" })
      .click();

    await page.waitForURL(vehiclePath);

    const repuestos = sectionByHeading(page, "Repuestos");
    const part = repuestos.locator("li").filter({ hasText: "Filtro E2E" });
    await expect(part.getByText("Wishlist")).toBeVisible();

    await part.getByRole("button", { name: "Marcar pendiente" }).click();
    await expect(part.getByText("Pendiente")).toBeVisible();
  });

  test("edits the vehicle name", async ({ page }) => {
    await page.goto(vehiclePath);

    await page
      .getByRole("link", { name: "Editar Renault 12 E2E" })
      .click();
    await expect(page).toHaveURL(/\/editar/);

    await page.getByLabel("Nombre").fill("Renault 12 E2E editado");
    await page
      .getByRole("button", { name: "Guardar cambios" })
      .click();

    await page.waitForURL(vehiclePath);
    await expect(
      page.getByRole("heading", { name: "Renault 12 E2E editado" }),
    ).toBeVisible();
  });

  test("archives and restores the vehicle", async ({ page }) => {
    await page.goto(vehiclePath);

    // Both the vehicle header and each maintenance-type row render an
    // "Archivar" submit. The vehicle's form only carries vehicleId; the
    // type rows' forms carry typeId too — that's the disambiguator.
    const vehicleArchiveForm = page
      .locator("form")
      .filter({ hasNot: page.locator('input[name="typeId"]') });
    await vehicleArchiveForm
      .getByRole("button", { name: "Archivar" })
      .click();
    await page.waitForURL(/\/dashboard$/);

    // It leaves the active pool and shows up under "Ver archivados".
    await page.getByRole("link", { name: /ver archivados/i }).click();
    await page
      .getByRole("link", { name: /Renault 12 E2E editado/ })
      .click();
    // Strict mode fails instantly if this resolves while the archived list
    // (one "Archivado" badge per card) is still mounted — wait for the
    // detail heading first.
    await expect(
      page.getByRole("heading", { name: "Renault 12 E2E editado" }),
    ).toBeVisible();
    await expect(page.getByText("Archivado")).toBeVisible();

    await vehicleArchiveForm
      .getByRole("button", { name: "Restaurar" })
      .click();
    await page.waitForURL(vehiclePath);
    await expect(
      vehicleArchiveForm.getByRole("button", { name: "Archivar" }),
    ).toBeVisible();
    await expect(page.getByText("Archivado")).not.toBeVisible();
  });
});
