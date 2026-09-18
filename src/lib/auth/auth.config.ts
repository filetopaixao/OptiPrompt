import type { NextAuthConfig } from "next-auth";

const PROTECTED_PATH_PREFIXES = ["/app", "/report", "/admin"];

/**
 * Config "Edge-safe" — sem Providers nem Prisma — usada tanto aqui quanto em
 * middleware.ts (que roda em Edge runtime, incompatível com o driver
 * node-postgres do Prisma). A config completa (com Credentials) fica em
 * auth.ts, só carregada em Server Components/Route Handlers (Node.js).
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const isProtected = PROTECTED_PATH_PREFIXES.some((prefix) =>
        request.nextUrl.pathname.startsWith(prefix),
      );
      return isProtected ? isLoggedIn : true;
    },
  },
} satisfies NextAuthConfig;
