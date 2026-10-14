import { defineConfig } from "@playwright/test";

// E2E contra la app real: backend (tsx) sirviendo frontend construido.
// Requiere PostgreSQL disponible (ver variables DB_* abajo o en el entorno).
export default defineConfig({
  testDir: ".",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run e2e:serve",
    url: "http://localhost:3000/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NODE_ENV: "production",
      JWT_SECRET: "e2e-secret",
      // forzar DB de pruebas: si backend/.env define DATABASE_URL (Neon local),
      // dotenv la cargaria y el e2e correria contra la base de produccion
      DATABASE_URL: "",
      DB_HOST: process.env.DB_HOST ?? "127.0.0.1",
      DB_PORT: process.env.DB_PORT ?? "5439",
      DB_USER: process.env.DB_USER ?? "postgres",
      DB_PASSWORD: process.env.DB_PASSWORD ?? "",
      DB_NAME: process.env.DB_NAME ?? "reservas_saas",
    },
  },
});
