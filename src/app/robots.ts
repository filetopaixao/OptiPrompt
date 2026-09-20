import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Áreas autenticadas/internas — sem conteúdo indexável, e o gate de
      // login já bloquearia o crawler mesmo sem isso.
      disallow: ["/app", "/admin", "/api", "/report", "/trocar-senha"],
    },
    sitemap: "https://otimizaia.app/sitemap.xml",
  };
}
