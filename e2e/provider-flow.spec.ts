import { test, expect, request as apiRequest, type APIRequestContext } from "@playwright/test";

async function register(api: APIRequestContext, suffix: string) {
  const email = `e2e-${suffix}@example.com`;
  const reg = await api.post("/api/auth/register", {
    data: { name: "E2E Proveedor", email, password: "password123" },
  });
  const user = (await reg.json()) as { id: number };
  return { email, userId: user.id };
}

test("el proveedor crea y edita un servicio desde el dashboard", async ({ page }) => {
  const api = await apiRequest.newContext();
  const { email } = await register(api, `provider-${Date.now()}`);

  await page.goto("/");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contrasena").fill("password123");
  await page.getByText("Ingresar", { exact: true }).click();

  // ir a Servicios
  await page.getByText("Servicios", { exact: true }).first().click();
  await page.getByText("+ Nuevo Servicio", { exact: true }).first().click();

  await page.getByLabel("Nombre del servicio *").fill("Servicio E2E");
  await page.getByText("Crear Servicio", { exact: true }).click();
  await expect(page.getByText("Servicio creado", { exact: true })).toBeVisible();

  // cerrar el modal (queda en la pestana de horarios tras crear)
  await page.getByText("Cerrar", { exact: true }).click();

  // editar: pre-fill + update real (no debe crear un duplicado)
  await page.getByText("Editar", { exact: true }).first().click();
  await expect(page.getByLabel("Nombre del servicio *")).toHaveValue("Servicio E2E");

  await page.getByLabel("Nombre del servicio *").fill("Servicio E2E editado");
  await page.getByText("Guardar cambios", { exact: true }).click();

  await expect(page.getByText("Servicio actualizado")).toBeVisible();
  await expect(page.getByText("Servicio E2E editado")).toBeVisible();
  await expect(page.getByText("Servicio E2E", { exact: true })).toHaveCount(0);
  await api.dispose();
});
