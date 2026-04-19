import { userCreds } from "@/userData";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.has("token");

    if (!cookieToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 },
      );
    }

    const token = cookieStore.get("token")?.value!;
    const refreshSecret = new TextEncoder().encode(
      process.env.NEXT_LOGIN_REFRESH_SECRET!,
    );
    const { payload } = await jwtVerify(token, refreshSecret);

    const user = userCreds.find((item) => item.email === payload.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const accessSecret = new TextEncoder().encode(
      process.env.NEXT_LOGIN_ACCESS_SECRET!,
    );
    const accessToken = await new SignJWT({ email: payload.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(accessSecret);

    return NextResponse.json({
      accessToken,
      message: "Access token Refreshed",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 },
    );
  }
}
