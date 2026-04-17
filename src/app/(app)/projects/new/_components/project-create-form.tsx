"use client";

import { useActionState } from "react";

import { AppButton } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";

import {
  createProjectAction,
  type CreateProjectState,
} from "../actions";

const initialState: CreateProjectState = {};

export function ProjectCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createProjectAction,
    initialState,
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
            />
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
            />
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
              />
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
              />
            </div>
          </div>
        </div>

        {state.errorMessage ? (
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
