"use client";

import { useActionState } from "react";

import { AppButton } from "@/components/ui/app-button";

import {
  setProjectArchiveStateAction,
  type ProjectArchiveActionState,
} from "../actions";

type ProjectArchiveFormProps = {
  projectId: string;
  isArchived: boolean;
};

const initialState: ProjectArchiveActionState = {};

export function ProjectArchiveForm({
  projectId,
  isArchived,
}: ProjectArchiveFormProps) {
  const [state, formAction, isPending] = useActionState(
    setProjectArchiveStateAction,
    initialState,
  );

  const nextStatus = isArchived ? "ACTIVE" : "ARCHIVED";
  const buttonLabel = isArchived
    ? "Aktifkan Kembali Project"
    : "Arsipkan Project";
  const helperText = isArchived
    ? "Project aktif kembali bisa diubah setelah statusnya dipulihkan."
    : "Project arsip tetap terlihat tetapi semua perubahan diblokir sampai project diaktifkan kembali.";

  return (
    <form action={formAction} className="space-y-2 sm:max-w-[280px]">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="nextStatus" value={nextStatus} />
      <AppButton
        type="submit"
        variant={isArchived ? "primary" : "secondary"}
        disabled={isPending}
      >
        {isPending ? "Menyimpan..." : buttonLabel}
      </AppButton>
      <p className="text-xs text-white/45">{helperText}</p>
      {state.errorMessage ? (
        <p aria-live="polite" className="text-sm text-red-300">
          {state.errorMessage}
        </p>
      ) : null}
    </form>
  );
}
