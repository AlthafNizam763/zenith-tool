import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const admin = await getSessionAdmin();
  if (admin) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
