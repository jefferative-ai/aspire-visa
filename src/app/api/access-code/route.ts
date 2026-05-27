import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { code?: string };
  const providedCode = body.code?.trim();
  const expectedCode = process.env.ACCESS_CODE?.trim();

  if (!expectedCode) {
    return NextResponse.json({ error: "Access code protection is not enabled." }, { status: 404 });
  }

  if (!providedCode || providedCode !== expectedCode) {
    return NextResponse.json({ error: "Invalid access code." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: "access_code_granted",
    value: "1",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
  });
  return response;
}
