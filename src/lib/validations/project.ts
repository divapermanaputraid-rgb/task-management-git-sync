import { z } from "zod";

const projectDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function parseProjectDate(value: string): Date | null {
  if (!projectDatePattern.test(value)) {
    return null;
  }

  const [yearPart, monthPart, dayPart] = value.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

const optionalProjectDateSchema = z.unknown().transform((value, ctx) => {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tanggal harus valid.",
    });

    return z.NEVER;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return null;
  }

  if (!projectDatePattern.test(trimmedValue)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tanggal harus memakai format YYYY-MM-DD.",
    });

    return z.NEVER;
  }

  const parsedDate = parseProjectDate(trimmedValue);

  if (!parsedDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tanggal harus valid.",
    });

    return z.NEVER;
  }

  return parsedDate;
});

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
    startDate: optionalProjectDateSchema,
    endDate: optionalProjectDateSchema,
  })
  .refine(
    (value) =>
      !value.startDate ||
      !value.endDate ||
      value.startDate.getTime() <= value.endDate.getTime(),
    {
      message: "Tanggal akhir harus sama atau setelah tanggal mulai.",
      path: ["endDate"],
    },
  );

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const toggleProjectArchiveSchema = z.object({
  projectId: z.string().trim().min(1, "Project tidak valid."),
  nextStatus: z.enum(["ACTIVE", "ARCHIVED"], {
    message: "Status project tidak valid.",
  }),
});

export type ToggleProjectArchiveInput = z.infer<
  typeof toggleProjectArchiveSchema
>;
