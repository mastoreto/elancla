// Crea (o promueve) el primer usuario administrador usando la API de Better Auth
// para que la contraseña se hashee igual que en el login. El rol es input:false,
// por eso se asigna con un update posterior al signup.
//
// Uso (con el .env del monorepo cargado: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL):
//   bun run --filter @ancla/auth seed:admin <email> <password> [nombre]
//   o vía SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME
import "./load-root-env"; // PRIMER import: carga el .env raíz antes que lo demás.
import { db } from "@ancla/db";
import { auth } from "../src/server";

const email = process.env.SEED_ADMIN_EMAIL ?? process.argv[2];
const password = process.env.SEED_ADMIN_PASSWORD ?? process.argv[3];
const name = process.env.SEED_ADMIN_NAME ?? process.argv[4] ?? "Administrador";

if (!email || !password) {
  console.error(
    "Uso: bun run --filter @ancla/auth seed:admin <email> <password> [nombre]\n" +
      "(o definí SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD)",
  );
  process.exit(1);
}

const existing = await db.user.findUnique({ where: { email } });

if (existing) {
  await db.user.update({ where: { email }, data: { role: "admin" } });
  console.log(`Usuario ${email} ya existía — rol actualizado a "admin".`);
  process.exit(0);
}

await auth.api.signUpEmail({ body: { email, password, name } });
await db.user.update({ where: { email }, data: { role: "admin" } });

console.log(`Admin creado: ${email}`);
process.exit(0);
