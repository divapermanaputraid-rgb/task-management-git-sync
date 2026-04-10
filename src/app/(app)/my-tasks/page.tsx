export default function MyTasksPage() {
  return (
    <main className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Tasks</h1>
        <p className="text-sm text-slate-600">
          Halaman ini akan menampilkan tugas yang ditugaskan ke developer.
        </p>
      </div>
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">
          Placeholder sementara untuk daftar tugas aktif, backlog, dan status
          review.
        </p>
      </section>
    </main>
  );
}
