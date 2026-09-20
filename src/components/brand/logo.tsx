import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Passe `false` para renderizar sem link (ex.: dentro do próprio dashboard). */
  href?: string | false;
  size?: number;
  className?: string;
  textClassName?: string;
}

export function Logo({ href = "/", size = 28, className, textClassName }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <Image
        src="/logo-icon.png"
        alt="OtimizaIA"
        width={size}
        height={size}
        className="shrink-0"
      />
      <span className={cn("whitespace-nowrap", textClassName)}>
        Otimiza<span className="text-[#00ab88]">IA</span>
      </span>
    </span>
  );

  if (href === false) return content;
  return <Link href={href}>{content}</Link>;
}
