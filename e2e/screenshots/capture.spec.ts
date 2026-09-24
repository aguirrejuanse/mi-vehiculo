import { signInSeededUser } from "../helpers";
import { expect, test } from "../fixtures";
import type { Page } from "@playwright/test";

// Scrubs dev-only noise before each capture: Next's dev-tools floating
// button always; the signed-in header nav only for authed shots (it shows
// "e2e-dashboard+clerk_test@example.com" — signed-out pages keep their nav,
// it has the real sign-in/CTA links).
async function scrub(page: Page, hideUserMenu = false): Promise<void> {
  await page.addStyleTag({
    content: `nextjs-portal{display:none!important}${hideUserMenu ? " header nav{visibility:hidden}" : ""}`,
  });
}

// Not a test suite — a generator. Re-run it whenever the UI changes and the
// committed PNGs under public/guia/ refresh themselves (the seeded garage is
// deterministic, so diffs only appear when the UI actually changed).
//
//   pnpm screenshots
//
// The wizard shot is taken before sign-in on purpose: /nuevo is the guest
// flow, the state a first-time visitor sees in the guide.
test("captures guide screenshots from the seeded garage", { tag: "@screenshots" }, async ({
  page,
}) => {
  // Guest wizard — step 1 (type picker) is the visual that maps to
  // "Creá tu vehículo" in the guide.
  await page.goto("/nuevo");
  await expect(
    page.getByRole("radio", { name: "Moto" }),
  ).toBeVisible();
  await scrub(page);
  await page.screenshot({ path: "public/guia/nuevo-vehiculo.png" });

  await signInSeededUser(page);

  // The garage: grouped vehicles with next-due status badges.
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: /tus vehículos/i }),
  ).toBeVisible();
  await scrub(page, true);
  await page.screenshot({ path: "public/guia/dashboard.png", fullPage: true });

  // Vehicle detail: on mobile the page stacks ~5k px tall — too tall for a
  // usable guide image, so each key section is captured as its own element
  // shot instead of one fullPage capture.
  await page.getByRole("link", { name: /Husqvarna TE 300/ }).click();
  await expect(
    page.getByRole("heading", { name: "Próximos mantenimientos" }),
  ).toBeVisible();
  await scrub(page, true);

  for (const [heading, name] of [
    ["Próximos mantenimientos", "detalle-vencimientos"],
    ["Repuestos", "detalle-repuestos"],
    ["Historial", "detalle-historial"],
    ["Tipos de mantenimiento", "detalle-tipos"],
  ] as const) {
    const section = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: heading }) });
    await section.screenshot({ path: `public/guia/${name}.png` });
  }
});
