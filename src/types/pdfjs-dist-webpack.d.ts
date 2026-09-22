/** "pdfjs-dist/webpack.mjs" não tem d.ts próprio — reexporta os mesmos tipos
 * do módulo principal, já que o arquivo real só faz `export * from
 * "./build/pdf.mjs"` (mais o setup do worker como efeito colateral). Ver uso
 * em prompt-editor-panel.tsx (extractPdfText). */
declare module "pdfjs-dist/webpack.mjs" {
  export * from "pdfjs-dist";
}
