import { test, expect, request as apiRequest, type APIRequestContext } from "@playwright/test";

async function seedProvider(api: APIRequestContext, suffix: string) {
  const email = `e2e-${suffix}@example.com`;
  await api.post("/api/auth/register", {
    data: { name: "Estudio Central", email, password: "password123" },
  });
  const login = await api.post("/api/auth/login", {
    data: { email, password: "password123" },
  });
  const { token } = (await login.json()) as { token: string };
  await api.post("/api/services", {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      name: "Consulta inicial",
      duration: 30,
      price: 20000,
      timezone: "America/Santiago",
      start_hour: 9,
      end_hour: 18,
    },
  });
  return { email, token };
}

test("el proveedor agenda una hora por telefono en dos toques", async ({ page }) => {
  const api = await apiRequest.newContext();
  const { email, token } = await seedProvider(api, `dentist-${Date.now()}`);

  // login
  await page.goto("/");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contrasena").fill("password123");
  await page.getByText("Ingresar", { exact: true }).click();

  // dia de manana: todos los huecos quedan en el futuro
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const dayNames = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  await page.getByRole("button", { name: "Semana siguiente" }).waitFor();
  const dayBtn = page.getByRole("button", {
    name: new RegExp(`^${dayNames[tomorrow.getDay()]} ${tomorrow.getDate()}$`),
  });
  if ((await dayBtn.count()) === 0) {
    await page.getByRole("button", { name: "Semana siguiente" }).click();
  }
  await dayBtn.click();
  await page.waitForTimeout(1000);

  // accion principal: agendar la hora del cliente que llama
  await page.getByRole("button", { name: "Agendar hora" }).click();

  // sheet: hora (selector del dia) + nombre + whatsapp
  await page.getByLabel("Nombre del cliente *").fill("Ana Torres");
  await page.getByLabel("WhatsApp *").fill("9 1234 5678");
  await page.locator("form").getByRole("button", { name: "Agendar hora" }).click();

  // confirmacion visual del flujo
  await expect(page.getByText("Hora agendada")).toBeVisible();

  // la cita quedo registrada en la agenda del proveedor
  const mine = await api.get("/api/bookings/my?limit=50", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { data } = (await mine.json()) as { data: { client_name: string; client_phone: string }[] };
  const booked = data.find((b) => b.client_name === "Ana Torres");
  expect(booked).toBeTruthy();
  expect(booked?.client_phone).toContain("56912345678");
  await api.dispose();
});
