import { test, expect, request as apiRequest, type APIRequestContext } from "@playwright/test";

async function seedService(api: APIRequestContext, suffix: string) {
  const email = `e2e-${suffix}@example.com`;
  await api.post("/api/auth/register", {
    data: { name: "E2E Proveedor", email, password: "password123" },
  });
  const login = await api.post("/api/auth/login", {
    data: { email, password: "password123" },
  });
  const { token } = (await login.json()) as { token: string };

  const svc = await api.post("/api/services", {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      name: `Servicio E2E ${suffix}`,
      duration: 30,
      price: 10000,
      timezone: "America/Santiago",
      start_hour: 9,
      end_hour: 18,
    },
  });
  const service = (await svc.json()) as { booking_slug: string };
  return { token, service };
}

test("un cliente reserva un turno desde el enlace publico", async ({ page }) => {
  const api = await apiRequest.newContext();
  const { service } = await seedService(api, `booking-${Date.now()}`);

  await page.goto(`/book/${service.booking_slug}`);
  await expect(page.getByText("Servicio E2E booking")).toBeVisible();

  // dia de manana en el date picker: todos los slots quedan en el futuro.
  // Si manana cae en otra semana, primero se avanza el date picker.
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const dayNames = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const dayBtn = page.getByRole("button", {
    name: new RegExp(`^${dayNames[tomorrow.getDay()]} ${tomorrow.getDate()}$`),
  });
  if ((await dayBtn.count()) === 0) {
    await page.getByRole("button", { name: "Semana siguiente" }).click();
  }
  await dayBtn.click();

  // esperar la recarga de disponibilidad del dia elegido
  const dateLabel = tomorrow.toLocaleDateString("es-CL", { day: "numeric", month: "long" });
  await expect(page.getByText(new RegExp(dateLabel))).toBeVisible();
  await page.waitForTimeout(800);

  await page.getByRole("button", { name: /09:00/ }).first().click();
  await page.getByText("Reservar", { exact: true }).click();

  await page.getByPlaceholder("Juan Perez").fill("Ana Torres");
  await page.getByPlaceholder("+56 9 1234 5678").fill("9 1234 5678");
  await page.getByText("Continuar", { exact: true }).click();
  await page.getByText("Reservar ahora", { exact: true }).click();

  await expect(page.getByText("Tu hora fue solicitada")).toBeVisible();
  await api.dispose();
});
