import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";

// Rotas que exigem usuario logado. As paginas de API fazem sua propria checagem
// de sessao tambem, entao isso e' principalmente para redirecionar no front-end.
const PROTECTED_PAGES = ["/create-event", "/profile", "/friends", "/chat"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED_PAGES.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/create-event/:path*", "/profile/:path*", "/friends/:path*", "/chat/:path*"],
};
