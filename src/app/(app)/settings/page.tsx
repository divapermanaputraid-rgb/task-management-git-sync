import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Settings"
        description="Halaman ini disiapkan untuk pengaturan akun dan konfigurasi workspace."
      />

      <EmptyState
        eyebrow="Settings"
        title="Pengaturan profil dan workspace akan muncul di sini."
        description="Halaman ini akan memuat pengaturan akun, akses, dan integrasi secara bertahap."
      />
    </main>
  );
}
