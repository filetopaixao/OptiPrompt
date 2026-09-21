import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

/**
 * Segunda camada de proteção pras rotas em PROTECTED_PATH_PREFIXES
 * (auth.config.ts) — roda em Edge, antes de qualquer Server Component.
 * Cada página sob /app, /report e /admin já se protege sozinha (layout.tsx
 * chamando requireActiveSubscription/requireAdmin, ou a própria página no
 * caso de /report), então isso é defesa em profundidade: se algum dia uma
 * página nova esquecer essa chamada, o middleware ainda barra o acesso.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
