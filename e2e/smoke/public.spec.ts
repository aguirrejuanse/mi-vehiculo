import { expect, test } from "../fixtures";

test.describe("public pages", { tag: "@smoke" }, () => {
  test("landing renders hero, sections and CTAs", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Mi Vehículo/);
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText(/Todo lo que tu .* necesita en una app/);
    await expect(
      page.getByRole("link", { name: "Iniciar sesión" }),
    ).toBeVisible();
    // The same CTA anchors to #crear from several landing sections.
    await expect(
      page.getByRole("link", { name: "Crear tu vehículo" }).first(),
    ).toBeVisible();

    // The embedded wizard anchors the conversion flow mid-landing.
    await expect(page.locator("#crear-title")).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Moto" }),
    ).toBeAttached();
  });

  test("hero variant page renders its own subject and metadata", async ({
    page,
  }) => {
    await page.goto("/moto-enduro");

    await expect(page).toHaveTitle(/moto de enduro/i);
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText("moto de enduro");
  });

  test("sign-in page renders the email code form", async ({ page }) => {
    await page.goto("/ingresar");

    await expect(
      page.getByRole("heading", { name: /iniciar/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Tu email")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continuar" }),
    ).toBeVisible();
  });

  test("guest wizard renders the type step and validates it", async ({
    page,
  }) => {
    await page.goto("/nuevo");

    await expect(
      page.getByRole("heading", { name: /nuevo/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Moto" }),
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Auto/Camioneta" }),
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Bicicleta" }),
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Monopatín" }),
    ).toBeVisible();

    // Continuar on an untouched step surfaces the field error in place.
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(
      page.getByText("Elegí un tipo de vehículo."),
    ).toBeVisible();
  });

  test("crawler metadata routes respond", async ({ request }) => {
    for (const path of [
      "/robots.txt",
      "/sitemap.xml",
      "/icon",
      "/apple-icon",
      "/opengraph-image",
    ]) {
      const response = await request.get(path);
      expect(response.ok(), `${path} should respond 2xx`).toBeTruthy();
    }

    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("User-Agent");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("<urlset");
  });

  test("legacy /sign-in redirects to /ingresar", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/\/ingresar$/);
  });

  test("protected routes redirect signed-out visitors to /ingresar", async ({
    page,
  }) => {
    const protectedPaths = [
      "/dashboard",
      "/dashboard/vehiculos/nuevo",
      "/dashboard/vehiculos/00000000-0000-0000-0000-000000000000",
      "/dashboard/vehiculos/00000000-0000-0000-0000-000000000000/registros/nuevo",
      "/dashboard/vehiculos/00000000-0000-0000-0000-000000000000/repuestos/nuevo",
    ];

    for (const path of protectedPaths) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/ingresar/);
      await expect(
        page.getByRole("heading", { name: /iniciar/i }),
      ).toBeVisible();
    }
  });

  test("unknown routes also redirect signed-out visitors to /ingresar", async ({
    page,
  }) => {
    // The middleware protects before the router resolves, so an anonymous
    // visitor never sees the 404 — they get sent to sign in first.
    await page.goto("/esto-no-existe");
    await expect(page).toHaveURL(/\/ingresar/);
  });
});
