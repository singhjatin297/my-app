import { getCookie } from "@/utils/cookie";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getCookie("refreshToken");
  if (!token) {
    redirect("/login");
  }
  return (
    <div>
      <header>
        <h2>Dashboard Header</h2>
        <nav>
          <Link href="/dashboard">Home</Link>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
