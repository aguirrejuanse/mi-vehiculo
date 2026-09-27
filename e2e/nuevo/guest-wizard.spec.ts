import { VehicleWizardPage } from "./vehicle-wizard-page";
import { expect, test } from "../fixtures";

test.describe("guest vehicle wizard", { tag: "@e2e" }, () => {
  test("a guest completes the wizard, signs up and lands on the new vehicle", async ({
    page,
  }) => {
    const wizard = new VehicleWizardPage(page);
    const email = `e2e-wizard-${Date.now()}+clerk_test@example.com`;
    const vehicleName = `Moto E2E ${Date.now()}`;

    await wizard.gotoGuest();

    // tipo → subtipo → motor → apodo → estado → uso → confirmar
    await wizard.pickOption("Moto");
    await wizard.next();
    await wizard.pickOption("Enduro/MX");
    await wizard.next();
    await wizard.pickOption("2 tiempos");
    await wizard.next();
    await wizard.fillName(vehicleName);
    await wizard.next();

    // enduro presets "Horas" via the subtype.
    await expect(
      page.getByRole("radio", { name: "Horas" }),
    ).toBeChecked();
    await wizard.fillCurrentValue("100");
    await wizard.next();
    await wizard.fillUsageRate("5");
    await wizard.next();

    // confirmar — review summary, then the guest email capture.
    await wizard.expectSummaryValue(vehicleName);
    await wizard.next();

    await wizard.submitGuestEmail(email);
    await wizard.submitGuestCode();
    await wizard.waitForVehicleRedirect();
    // moto_enduro has a catalog-backed plan → the redirect lands on /listo;
    // this spec asserts the vehicle detail, so skip it.
    await wizard.skipSuggestedPlan();

    await expect(
      page.getByRole("heading", { name: vehicleName }),
    ).toBeVisible();
    // value and unit live in sibling spans — no whitespace text node joins
    // them in the DOM, so match with a flexible regex.
    await expect(page.getByText(/100\s*horas/)).toBeVisible();

    // And the vehicle is listed back on the dashboard.
    await page.goto("/dashboard");
    await expect(
      page.getByRole("link", { name: new RegExp(vehicleName) }),
    ).toBeVisible();
  });

  test("the wizard blocks Continuar while the current step is invalid", async ({
    page,
  }) => {
    const wizard = new VehicleWizardPage(page);
    await wizard.gotoGuest();

    await wizard.pickOption("Auto/Camioneta");
    await wizard.next();

    // autos have no subtype step → lands on motor; skipping the engine
    // pick must not pass either.
    await wizard.next();
    await expect(page.getByText("Elegí una opción.")).toBeVisible();
    await wizard.pickOption("Nafta");
    await wizard.next();

    // apodo: empty name must not pass.
    await wizard.next();
    await expect(
      page.getByText("Ponele un nombre al vehículo."),
    ).toBeVisible();

    await wizard.fillName("Fitito E2E");
    await wizard.next();

    // estado: missing metricUnit + currentValue blocks too.
    await wizard.next();
    await expect(page.getByText("Elegí una unidad de medida.")).toBeVisible();
  });
});
