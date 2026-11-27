import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import {
  fetchUsername,
  getAuthToken,
  verifyAdminToken,
} from "@/lib/server-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAuthToken();
  if (!token) {
    redirect("/login");
  }

  const isAdmin = await verifyAdminToken(token);
  if (!isAdmin) {
    redirect("/login?expired=1");
  }

  const username = await fetchUsername(token);

  return <AdminShell username={username}>{children}</AdminShell>;
}
