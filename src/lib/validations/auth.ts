import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email harus valid."),
  password: z.string().min(1, "Password harus diisi."),
});

export type LoginInput = z.infer<typeof loginSchema>;
