"use client";

import { useActionState } from "react";

import { AppButton } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";

import { createTaskAction, type CreateTaskState } from "../actions";

const initialState: CreateTaskState = {};

type TaskCreateFormProps = {
  projectId: string;
};

export function TaskCreateForm({ projectId }: TaskCreateFormProps) {
  const [state, formAction, isPending] = useActionState(
    createTaskAction,
    initialState,
  );

  const hasFieldError = Boolean(
    state.fieldErrors && Object.keys(state.fieldErrors).length > 0,
  );

  return (
    <AppSurface className="space-y-5">
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="projectId" value={projectId} />

        <div className="grid gap-4">
          <div className="space-y-2">
            <label
              htmlFor="task-title"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35"
            >
              Judul Task
            </label>
            <input
              id="task-title"
              name="title"
              type="text"
              required
              minLength={3}
              maxLength={120}
              placeholder="Contoh: Susun halaman detail tugas"
              className="w-full rounded-xl border border-white/10 bg-[#121217] px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#f0a832]/40"
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.title)}
              aria-describedby={
                state.fieldErrors?.title ? "task-title-error" : undefined
              }
            />
            {state.fieldErrors?.title ? (
              <p id="task-title-error" className="text-sm text-red-300">
                {state.fieldErrors.title}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="task-description"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35"
            >
              Deskripsi
            </label>
            <textarea
              id="task-description"
              name="description"
              rows={5}
              maxLength={1000}
              placeholder="Tulis konteks pekerjaan yang perlu dipahami sebelum task dikerjakan."
              className="w-full rounded-xl border border-white/10 bg-[#121217] px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#f0a832]/40"
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.description)}
              aria-describedby={
                state.fieldErrors?.description
                  ? "task-description-error"
                  : undefined
              }
            />
            {state.fieldErrors?.description ? (
              <p id="task-description-error" className="text-sm text-red-300">
                {state.fieldErrors.description}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="task-start-date"
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35"
              >
                Tanggal Mulai
              </label>
              <input
                id="task-start-date"
                name="startDate"
                type="date"
                className="w-full rounded-xl border border-white/10 bg-[#121217] px-4 py-3 text-sm text-white outline-none focus:border-[#f0a832]/40"
                disabled={isPending}
                aria-invalid={Boolean(state.fieldErrors?.startDate)}
                aria-describedby={
                  state.fieldErrors?.startDate
                    ? "task-start-date-error"
                    : undefined
                }
              />
              {state.fieldErrors?.startDate ? (
                <p id="task-start-date-error" className="text-sm text-red-300">
                  {state.fieldErrors.startDate}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="task-end-date"
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35"
              >
                Tanggal Selesai
              </label>
              <input
                id="task-end-date"
                name="endDate"
                type="date"
                className="w-full rounded-xl border border-white/10 bg-[#121217] px-4 py-3 text-sm text-white outline-none focus:border-[#f0a832]/40"
                disabled={isPending}
                aria-invalid={Boolean(state.fieldErrors?.endDate)}
                aria-describedby={
                  state.fieldErrors?.endDate ? "task-end-date-error" : undefined
                }
              />
              {state.fieldErrors?.endDate ? (
                <p id="task-end-date-error" className="text-sm text-red-300">
                  {state.fieldErrors.endDate}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {state.errorMessage && !hasFieldError ? (
          <p className="text-sm text-red-300">{state.errorMessage}</p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <AppButton href={`/projects/${projectId}`} variant="ghost">
            Batal
          </AppButton>
          <AppButton type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Buat Task"}
          </AppButton>
        </div>
      </form>
    </AppSurface>
  );
}
