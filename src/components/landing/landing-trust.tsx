import { FileText, MessageCircle, ShieldCheck, Trash2, type LucideIcon } from "lucide-react";

interface TrustLink {
  href: string;
  icon: LucideIcon;
  label: string;
  external?: boolean;
}

const LINKS: TrustLink[] = [
  { href: "/privacidade", icon: ShieldCheck, label: "Política de privacidade" },
  { href: "/termos", icon: FileText, label: "Termos de uso" },
  { href: "/retencao", icon: Trash2, label: "Retenção e exclusão de dados" },
  { href: "https://wa.me/5571999018102", icon: MessageCircle, label: "Contato e suporte", external: true },
];

export function LandingTrust() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Confiança e transparência</h2>
      </div>

      <div className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
        <p>
          O OtimizaIA usa o{" "}
          <a
            href="https://openrouter.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            OpenRouter
          </a>{" "}
          como camada de acesso aos modelos — seu prompt e os arquivos anexados são enviados ao
          OpenRouter e ao provedor do modelo escolhido (OpenAI, Anthropic, Google etc.) só durante
          a execução do teste, exatamente como se você chamasse a API do provedor diretamente.
          Disponibilidade e custo dependem do OpenRouter e de cada provedor. Recomendamos não
          enviar dados de clientes sem anonimizar quando o teste não precisar do dado real.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LINKS.map(({ href, icon: Icon, label, external }) => (
          <a
            key={href}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="flex items-center gap-2 rounded-lg border bg-background p-3 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}
