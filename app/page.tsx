import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const hasRefreshToken = cookieStore.has("token");

  redirect(hasRefreshToken ? "/dashboard" : "/login");
}
