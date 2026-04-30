import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { AppButton } from "@/components/ui/app-button";
import { getLoginRedirectUrl } from "@/lib/auth/redirects";
import { canCreateTask } from "@/lib/Permission";
import { getVisibleProjectDetail } from "@/lib/projects/queries";

import { TaskCreateForm } from "./_components/task-create-form";

type NewTaskPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function NewTaskPage({ params }: NewTaskPageProps) {
  const { projectId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(getLoginRedirectUrl(`/projects/${projectId}/tasks/new`));
  }

  if (!canCreateTask(session.user.role)) {
    return (
      <main className="space-y-6">
        <PageHeader
          eyebrow="Tasks"
          title="Buat Task"
          description="Halaman ini hanya tersedia untuk PM/Admin."
        />

        <EmptyState
          eyebrow="Akses"
          title="Anda tidak punya akses untuk membuat task."
          description="Silakan kembali ke detail project untuk melihat task yang tersedia."
          action={
            <AppButton href={`/projects/${projectId}`} variant="secondary">
              Kembali ke Project
            </AppButton>
          }
        />
      </main>
    );
  }

  const project = await getVisibleProjectDetail({
    projectId,
    userId: session.user.id,
    role: session.user.role,
  });

  if (!project) {
    notFound();
  }

  if (project.status === "ARCHIVED") {
    return (
      <main className="space-y-6">
        <PageHeader
          eyebrow="Tasks"
          title="Buat Task"
          description="Project arsip tidak bisa menerima task baru."
        />

        <EmptyState
          eyebrow="Read-only"
          title="Project ini sedang diarsipkan."
          description="Aktifkan project terlebih dahulu sebelum menambahkan task baru."
          action={
            <AppButton href={`/projects/${project.id}`} variant="secondary">
              Kembali ke Project
            </AppButton>
          }
        />
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Tasks"
        title="Buat Task"
        description={`Tambahkan task backlog baru untuk ${project.name}.`}
      />

      <TaskCreateForm projectId={project.id} />
    </main>
  );
}
