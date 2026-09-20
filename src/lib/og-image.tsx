import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_ALT = "OtimizaIA — Testes de Prompts e AI FinOps para Agências";

const logoData = await readFile(join(process.cwd(), "public/logo.png"), "base64");
const logoSrc = `data:image/png;base64,${logoData}`;

/** Gera o card de link (og:image/twitter:image) com a logo — usado por
 * app/opengraph-image.tsx e app/twitter-image.tsx. Antes era um screenshot
 * estático do app que ficou desatualizado depois do rebrand pra OtimizaIA. */
export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          background: "#f8fafc",
        }}
      >
        {/* next/og (Satori) exige <img> puro — next/image não é suportado aqui. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={560} height={395} alt="OtimizaIA" />
        <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: "#0a1a4a" }}>
          Testes de Prompts e AI FinOps para Agências
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE },
  );
}
