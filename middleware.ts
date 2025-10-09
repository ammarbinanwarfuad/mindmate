import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(req: Request) {
  const session = await auth();

  if (!session) {
    const url = new URL("/api/auth/signin", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/mood/:path*",
    "/matches/:path*",
    "/community/:path*",
    "/profile/:path*",
    "/resources/:path*",
  ],
};
