import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export default function ProjectsPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Projects"
        description="Halaman ini akan menjadi entry list project untuk PM/Admin dan developer sesuai membership."
      />

      <EmptyState
        eyebrow="Projects"
        title="Daftar project aktif akan muncul di sini."
        description="Halaman ini akan menampilkan ringkasan status, progres, dan akses ke detail project."
      />
    </main>
  );
}
