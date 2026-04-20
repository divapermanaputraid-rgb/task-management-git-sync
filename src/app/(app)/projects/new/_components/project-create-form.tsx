"use client";

import { useActionState } from "react";

import { AppButton } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";

import { createProjectAction, type CreateProjectState } from "../actions";

const initialState: CreateProjectState = {};

export function ProjectCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createProjectAction,
    initialState,
  );

  const hasFieldError = Boolean(
    state.fieldErrors && Object.keys(state.fieldErrors).length > 0,
  );
  return (
    <AppSurface className="space-y-5">
      <form action={formAction} className="space-y-5">
        <div className="grid gap-4">
          <div className="space-y-2">
            <label
              htmlFor="project-name"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35"
            >
              Nama Project
            </label>
            <input
              id="project-name"
              name="name"
              type="text"
              required
              minLength={3}
              maxLength={100}
              placeholder="Contoh: Portal Operasional"
              className="w-full rounded-xl border border-white/10 bg-[#121217] px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#f0a832]/40"
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.name)}
              aria-describedby={
                state.fieldErrors?.name ? "project-name-error" : undefined
              }
            />
            {state.fieldErrors?.name ? (
              <p id="project-name-error" className="text-sm text-red-300">
                {state.fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="project-description"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35"
            >
              Deskripsi
            </label>
            <textarea
              id="project-description"
              name="description"
              rows={4}
              maxLength={500}
              placeholder="Ringkasan singkat tujuan project."
              className="w-full rounded-xl border border-white/10 bg-[#121217] px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#f0a832]/40"
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.description)}
              aria-describedby={
                state.fieldErrors?.description
                  ? "project-description-error"
                  : undefined
              }
            />
            {state.fieldErrors?.description ? (
              <p
                id="project-description-error"
                className="text-sm text-red-300"
              >
                {state.fieldErrors?.description}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="project-start-date"
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35"
              >
                Tanggal Mulai
              </label>
              <input
                id="project-start-date"
                name="startDate"
                type="date"
                className="w-full rounded-xl border border-white/10 bg-[#121217] px-4 py-3 text-sm text-white outline-none focus:border-[#f0a832]/40"
                disabled={isPending}
                aria-invalid={Boolean(state.fieldErrors?.startDate)}
                aria-describedby={
                  state.fieldErrors?.startDate
                    ? "project-start-date-error"
                    : undefined
                }
              />
              {state.fieldErrors?.startDate ? (
                <p
                  id="project-start-date-error"
                  className="text-sm text-red-300"
                >
                  {state.fieldErrors.startDate}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="project-end-date"
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35"
              >
                Tanggal Selesai
              </label>
              <input
                id="project-end-date"
                name="endDate"
                type="date"
                className="w-full rounded-xl border border-white/10 bg-[#121217] px-4 py-3 text-sm text-white outline-none focus:border-[#f0a832]/40"
                disabled={isPending}
                aria-invalid={Boolean(state.fieldErrors?.endDate)}
                aria-describedby={
                  state.fieldErrors?.endDate
                    ? "project-end-date-error"
                    : undefined
                }
              />
              {state.fieldErrors?.endDate ? (
                <p id="project-end-date-error" className="text-sm text-red-300">
                  {state.fieldErrors?.endDate}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {state.errorMessage && !hasFieldError ? (
          <p className="text-sm text-red-300">{state.errorMessage}</p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <AppButton href="/projects" variant="ghost">
            Batal
          </AppButton>
          <AppButton type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Buat Project"}
          </AppButton>
        </div>
      </form>
    </AppSurface>
  );
}
