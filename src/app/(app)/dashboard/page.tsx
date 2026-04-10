import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Anda Berhasil masuk</p>
      </div>
      <div className="rounded-xl border p-4">
        <p className="text-sm">
          <span className="font-medium">User ID:</span> {session?.user.id}
        </p>
        <p className="text-sm">
          <span className="font-medium">Email:</span> {session?.user.email}
        </p>
        <p className="text-sm">
          <span className="font-medium">Role</span> {session?.user.role}
        </p>
      </div>
    </main>
  );
}
