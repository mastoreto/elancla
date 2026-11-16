// Config de Prisma CLI (db:push / generate / migrate / studio).
// Carga el .env raíz del monorepo para que no haga falta exportar DATABASE_URL a
// mano. dotenv NO sobreescribe variables ya presentes (p. ej. las que inyecta
// docker-compose) y si el archivo no existe simplemente lo ignora.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

const dir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(dir, "../../.env") });

export default defineConfig({
  schema: path.join(dir, "prisma", "schema.prisma"),
});
