// Preload de entorno: carga el .env raíz del monorepo ANTES de importar @ancla/db
// y la config de Better Auth. Debe importarse como PRIMER import del script para
// que sus efectos corran antes de evaluar los módulos siguientes (orden ESM).
// dotenv no sobreescribe variables ya presentes ni falla si el archivo no existe.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const dir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(dir, "../../../.env") });
