export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang Anda cari tidak tersedia.
        </p>
      </div>
    </main>
  );
}
