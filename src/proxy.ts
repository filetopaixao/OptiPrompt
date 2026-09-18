import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

const { auth } = NextAuth(authConfig);

// Reexportar `auth` direto (`export const { auth: proxy } = ...`) não
// satisfaz a checagem estática do Next.js 16 por uma função nomeada `proxy`
// — precisa ser uma declaração de função de verdade.
export function proxy(...args: Parameters<typeof auth>) {
  return auth(...args);
}

export const config = {
  matcher: ["/app/:path*", "/report/:path*", "/admin/:path*"],
};
