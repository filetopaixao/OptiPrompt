import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_ALT = "OtimizaIA — Testes de Prompts e AI FinOps para Agências";

const logoData = await readFile(join(process.cwd(), "public/logo-social.jpg"), "base64");
const logoSrc = `data:image/jpeg;base64,${logoData}`;

/** Gera o card de link (og:image/twitter:image) com a logo — usado por
 * app/opengraph-image.tsx e app/twitter-image.tsx. Antes era um screenshot
 * estático do app que ficou desatualizado depois do rebrand pra OtimizaIA.
 * Só a logo, sem o slogan embaixo — quando o link é colado numa rede
 * social o card já mostra o título/descrição da página ao lado, então o
 * slogan repetido dentro da imagem ficava redundante e poluído. */
export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        {/* next/og (Satori) exige <img> puro — next/image não é suportado aqui. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={480} height={480} alt="OtimizaIA" />
      </div>
    ),
    { ...OG_IMAGE_SIZE },
  );
}
