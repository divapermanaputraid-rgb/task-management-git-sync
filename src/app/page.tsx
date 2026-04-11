import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getDefaultAppRoute } from "@/lib/auth/redirects";

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  redirect(getDefaultAppRoute(session.user.role));
}
