import { z } from "zod";

const optionalDateString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}, z.union([z.string(), z.null()]).refine((value) => {
  if (value === null) {
    return true;
  }

  return !Number.isNaN(Date.parse(value));
}, {
  message: "Tanggal harus valid.",
}));

export const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Nama project minimal 3 karakter.")
      .max(100, "Nama project maksimal 100 karakter."),
    description: z
      .string()
      .trim()
      .max(500, "Deskripsi project maksimal 500 karakter.")
      .transform((value) => (value.length > 0 ? value : null))
      .nullable(),
    startDate: optionalDateString,
    endDate: optionalDateString,
  })
  .refine(
    (value) =>
      !value.startDate ||
      !value.endDate ||
      new Date(value.startDate) <= new Date(value.endDate),
    {
      message: "Tanggal akhir harus sama atau setelah tanggal mulai.",
      path: ["endDate"],
    },
  );

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
