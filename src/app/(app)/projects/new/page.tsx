import { redirect } from "next/navigation";
import { getLoginRedirectUrl } from "@/lib/auth/redirects";
import { auth } from "@/auth";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { AppButton } from "@/components/ui/app-button";
import { canCreateProject } from "@/lib/Permission";

import { ProjectCreateForm } from "./_components/project-create-form";

export default async function NewProjectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(getLoginRedirectUrl("/projects/new"));
  }

  if (!canCreateProject(session.user.role)) {
    return (
      <main className="space-y-6">
        <PageHeader
          eyebrow="Projects"
          title="Buat Project"
          description="Halaman ini hanya tersedia untuk PM/Admin."
        />

        <EmptyState
          eyebrow="Akses"
          title="Anda tidak punya akses untuk membuat project."
          description="Silakan kembali ke halaman Projects untuk melihat daftar project yang tersedia."
          action={
            <AppButton href="/projects" variant="secondary">
              Kembali ke Projects
            </AppButton>
          }
        />
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="Buat Project"
        description="Buat baseline project baru dengan nama, deskripsi, dan timeline dasar."
      />

      <ProjectCreateForm />
    </main>
  );
}
