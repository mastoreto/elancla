import { z } from "zod";

export const userInviteSchema = z.object({
  name: z.string().trim().min(1, "Ingresa el nombre y apellido"),
  email: z.string().trim().min(1, "Ingresa el email").pipe(z.email("Ingresa un email válido")),
  role: z.string().min(1, "Elige un rol"),
  ministry: z.string(),
});

export type UserInviteValues = z.infer<typeof userInviteSchema>;
export type UserInviteErrors = Partial<Record<keyof UserInviteValues, string>>;
