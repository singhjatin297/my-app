import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("refreshToken");
    return NextResponse.json({ message: "User logged out" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "User logout failed" }, { status: 500 });
  }
}
