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

  await page.getByRole("button", { name: /^\d{2}:\d{2}/ }).first().click();
  await page.getByText("Reservar", { exact: true }).click();

  await page.getByPlaceholder("Juan Perez").fill("Ana Torres");
  await page.getByPlaceholder("juan@example.com").fill("ana@example.com");
  await page.getByText("Continuar", { exact: true }).click();
  await page.getByText("Confirmar reserva", { exact: true }).click();

  await expect(page.getByText("Reserva Solicitada")).toBeVisible();
  await api.dispose();
});
