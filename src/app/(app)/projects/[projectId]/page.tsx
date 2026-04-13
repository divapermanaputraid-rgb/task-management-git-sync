import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { AppButton } from "@/components/ui/app-button";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { projectId } = await params;

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Project Detail"
        title="Project Detail"
        description={`Halaman ini menyiapkan konteks kerja untuk project dengan ID ${projectId}.`}
      />

      <EmptyState
        eyebrow="Board Context"
        title="Board dan ringkasan project akan muncul di sini."
        description="Halaman ini akan menampilkan anggota, aktivitas, dan board project dalam satu konteks kerja."
        action={
          <AppButton href="/projects" variant="secondary">
            Kembali ke Projects
          </AppButton>
        }
      />
    </main>
  );
}
