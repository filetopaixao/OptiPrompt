import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Base pra resolver URLs relativas de OG/Twitter image e canonical em
  // todas as páginas — sem isso o Next não consegue montar URL absoluta.
  metadataBase: new URL("https://optiprompt.com.br"),
  title: "OptiPrompt",
  description: "Teste, compare custos e versione prompts em múltiplos modelos de IA.",
  verification: { google: "W1lf-27wYAdDwN7BpLt7aGtqJPrh0n2PqfMdcjdQH_k" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <AuthSessionProvider>
          <TooltipProvider delay={150}>
            {children}
            <Toaster />
          </TooltipProvider>
        </AuthSessionProvider>
        <GoogleAnalytics gaId="G-H2WFVVKXFN" />
      </body>
    </html>
  );
}
