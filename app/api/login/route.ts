import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { userCreds } from "@/userData";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const { email, password } = body;

    const user = userCreds.find((item) => item.email === email);
    if (!user) {
      return NextResponse.json({ error: "No User Found" }, { status: 404 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid Password" }, { status: 401 });
    }

    const accessSecret = new TextEncoder().encode(
      process.env.NEXT_LOGIN_ACCESS_SECRET!,
    );
    const accessToken = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(accessSecret);

    const refreshSecret = new TextEncoder().encode(
      process.env.NEXT_LOGIN_REFRESH_SECRET!,
    );
    const refreshToken = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(refreshSecret);

    const isProd = process.env.NODE_ENV === "production";

    cookieStore.set({
      name: "token",
      value: refreshToken,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: isProd,
      sameSite: "lax",
    });

    return NextResponse.json(
      { message: "Login successful!", accessToken },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }
}
