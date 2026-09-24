import { SEEDED_USER_EMAIL, TEST_OTP_CODE } from "../helpers";
import { expect, test } from "../fixtures";

test.describe("sign-in at /ingresar", { tag: "@e2e" }, () => {
  test("existing user signs in with an email code and lands on /dashboard", async ({
    page,
  }) => {
    await page.goto("/ingresar");

    await page.getByLabel("Tu email").fill(SEEDED_USER_EMAIL);
    await page.getByRole("button", { name: "Continuar" }).click();

    // The email already has an account → the form switches to sign-in mode.
    await expect(
      page.getByText("Ya tenés cuenta con ese mail."),
    ).toBeVisible();

    await page.getByLabel("Código de verificación").fill(TEST_OTP_CODE);
    await page.getByRole("button", { name: "Verificar código" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { name: /tus vehículos/i }),
    ).toBeVisible();
  });

  test("new email signs up with an email code and lands on /dashboard", async ({
    page,
  }) => {
    const email = `e2e-ingresar-${Date.now()}+clerk_test@example.com`;

    await page.goto("/ingresar");
    await page.getByLabel("Tu email").fill(email);
    await page.getByRole("button", { name: "Continuar" }).click();

    await page.getByLabel("Código de verificación").fill(TEST_OTP_CODE);
    await page.getByRole("button", { name: "Verificar código" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByText("Todavía no tenés vehículos cargados."),
    ).toBeVisible();
  });

  test("a wrong code shows an inline error and stays on the page", async ({
    page,
  }) => {
    await page.goto("/ingresar");
    await page.getByLabel("Tu email").fill(SEEDED_USER_EMAIL);
    await page.getByRole("button", { name: "Continuar" }).click();

    await page.getByLabel("Código de verificación").fill("000000");
    await page.getByRole("button", { name: "Verificar código" }).click();

    await expect(
      page.getByText("Ese código no es correcto. Revisalo y probá de nuevo."),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/ingresar/);
    // The code input resets so the visitor can retry immediately.
    await expect(page.getByLabel("Código de verificación")).toHaveValue("");
  });
});
