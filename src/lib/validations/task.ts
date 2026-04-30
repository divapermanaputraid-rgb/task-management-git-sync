import { z } from "zod";

const taskDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function parseTaskDate(value: string): Date | null {
  if (!taskDatePattern.test(value)) {
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

const optionalTaskDateSchema = z.unknown().transform((value, ctx) => {
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

  if (!taskDatePattern.test(trimmedValue)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tanggal harus memakai format YYYY-MM-DD.",
    });

    return z.NEVER;
  }

  const parsedDate = parseTaskDate(trimmedValue);

  if (!parsedDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tanggal harus valid.",
    });

    return z.NEVER;
  }

  return parsedDate;
});

export const createTaskSchema = z
  .object({
    projectId: z.string().trim().min(1, "Project tidak valid."),
    title: z
      .string()
      .trim()
      .min(3, "Judul task minimal 3 karakter.")
      .max(120, "Judul task maksimal 120 karakter."),
    description: z
      .string()
      .trim()
      .max(1000, "Deskripsi task maksimal 1000 karakter.")
      .transform((value) => (value.length > 0 ? value : null))
      .nullable(),
    startDate: optionalTaskDateSchema,
    endDate: optionalTaskDateSchema,
  })
  .superRefine((value, ctx) => {
    if (value.startDate && !value.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tanggal mulai dan akhir harus diisi bersama.",
        path: ["endDate"],
      });
    }

    if (!value.startDate && value.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tanggal mulai dan akhir harus diisi bersama.",
        path: ["startDate"],
      });
    }

    if (
      value.startDate &&
      value.endDate &&
      value.startDate.getTime() > value.endDate.getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tanggal akhir harus sama atau setelah tanggal mulai.",
        path: ["endDate"],
      });
    }
  });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
