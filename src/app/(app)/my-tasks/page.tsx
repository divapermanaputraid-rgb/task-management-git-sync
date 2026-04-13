import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export default function MyTasksPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="My Tasks"
        description="Halaman ini akan menampilkan tugas yang ditugaskan ke developer."
      />

      <EmptyState
        eyebrow="Execution View"
        title="Daftar tugas aktif akan muncul di sini."
        description="Halaman ini akan memprioritaskan tugas yang sedang dikerjakan, backlog pribadi, dan status review."
      />
    </main>
  );
}
