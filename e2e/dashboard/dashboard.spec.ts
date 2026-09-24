import { signInSeededUser } from "../helpers";
import { expect, test } from "../fixtures";

test.beforeEach(async ({ page }) => {
  await signInSeededUser(page);
});

// Runs against the garage seeded in global-setup (scripts/seed.ts --fresh):
// 10 active vehicles + 1 archived, covering every next-due status.
test.describe("dashboard", { tag: "@e2e" }, () => {
  test("lists vehicles grouped by type with status", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(
      page.getByRole("heading", { name: /tus vehículos/i }),
    ).toBeVisible();

    // Filter chips for every type group.
    for (const chip of ["Todos", "Motos", "Autos", "Bicis", "Monopatines"]) {
      await expect(
        page.getByRole("link", { name: new RegExp(chip, "i") }),
      ).toBeVisible();
    }

    // Seeded vehicles and an urgency label.
    await expect(
      page.getByRole("link", { name: /Husqvarna TE 300/ }),
    ).toBeVisible();
    await expect(page.getByText(/· Vencido/).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Nuevo vehículo" }),
    ).toBeVisible();
  });

  test("filters the list by type via the chips", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("link", { name: /Motos/ }).first().click();
    await expect(page).toHaveURL(/\/dashboard\?tipo=moto/);

    await expect(
      page.getByRole("link", { name: /Husqvarna TE 300/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Yamaha FZ 150/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Fiat 600/ }),
    ).not.toBeVisible();
  });

  test("the archived view lists archived vehicles", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("link", { name: /ver archivados/i }).click();
    await expect(page).toHaveURL(/ver=archivados/);

    await expect(
      page.getByRole("link", { name: /Honda XR 200/ }),
    ).toBeVisible();
    await expect(page.getByText("Archivado").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Husqvarna TE 300/ }),
    ).not.toBeVisible();
  });

  test("vehicle detail shows next-due, parts and history", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /Husqvarna TE 300/ }).click();

    await expect(page).toHaveURL(/\/dashboard\/vehiculos\/[\w-]+/);
    await expect(
      page.getByRole("heading", { name: "Husqvarna TE 300" }),
    ).toBeVisible();
    await expect(page.getByText("Moto · Enduro/MX")).toBeVisible();
    // value and unit render in sibling spans (no joining whitespace node).
    await expect(page.getByText(/120\s*horas/)).toBeVisible();

    // Próximos mantenimientos: the seed covers every status badge.
    const proximos = page
      .locator("section")
      .filter({
        has: page.getByRole("heading", { name: "Próximos mantenimientos" }),
      });
    await expect(proximos.getByText("Cambio de aceite")).toBeVisible();
    await expect(proximos.getByText("Vencido").first()).toBeVisible();
    await expect(proximos.getByText("Pronto").first()).toBeVisible();
    await expect(proximos.getByText("Al día")).toBeVisible();
    await expect(proximos.getByText("Sin registro")).toBeVisible();

    // Repuestos: seeded parts in each lifecycle state.
    const repuestos = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Repuestos" }) });
    await expect(
      repuestos.getByText("Pastillas de freno delantero"),
    ).toBeVisible();
    await expect(
      repuestos.getByText("Pendiente", { exact: true }),
    ).toBeVisible();
    await expect(repuestos.getByText("Wishlist").first()).toBeVisible();
    await expect(repuestos.getByText("Instalado").first()).toBeVisible();

    // Tipos de mantenimiento: management list, archived type included.
    const tipos = page
      .locator("section")
      .filter({
        has: page.getByRole("heading", { name: "Tipos de mantenimiento" }),
      });
    await expect(tipos.getByText("Lavado general")).toBeVisible();
    await expect(tipos.getByText("Bujía (tipo viejo)")).toBeVisible();
  });

  test("history paginates with Cargar más", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /Husqvarna TE 300/ }).click();

    const historial = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Historial" }) });
    // Log cards all carry an "Editar" link — the "Cargar más" wrapper <li>
    // doesn't, so it stays out of the count.
    const logs = historial
      .locator("li")
      .filter({ has: page.getByRole("link", { name: "Editar" }) });

    // The seed creates 20 logs for the Husky; the first page caps at 10.
    await expect(logs).toHaveCount(10);

    const loadMore = historial.getByRole("button", { name: "Cargar más" });
    await loadMore.click();
    await expect(logs).toHaveCount(20);
    await expect(loadMore).not.toBeVisible();
  });

  test("log edit history page shows previous values", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /Husqvarna TE 300/ }).click();

    await page.getByRole("link", { name: "Editado (2)" }).click();

    await expect(page).toHaveURL(/\/registros\/[\w-]+\/historial/);
    await expect(
      page.getByRole("heading", { name: /historial del registro/i }),
    ).toBeVisible();
    await expect(page.getByText("valor corregido")).toBeVisible();
    await expect(page.getByText(/104 horas/)).toBeVisible();
  });

  test("a vehicle id that does not exist renders the 404", async ({
    page,
  }) => {
    await page.goto(
      "/dashboard/vehiculos/00000000-0000-0000-0000-000000000000",
    );
    await expect(
      page.getByRole("heading", { name: "404" }),
    ).toBeVisible();
    await expect(
      page.getByText("No encontramos esta página."),
    ).toBeVisible();
  });
});
