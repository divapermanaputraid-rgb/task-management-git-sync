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
    <main className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Project Detail
        </h1>
        <p className="text-sm text-slate-600">
          Placeholder detail untuk project dengan ID <span>{projectId}</span>.
        </p>
      </div>
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">
          Nantinya halaman ini akan menampilkan board, anggota, dan aktivitas
          project.
        </p>
      </section>
    </main>
  );
}
