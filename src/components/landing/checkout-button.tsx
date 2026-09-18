import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function CheckoutButton({ planSlug, label }: { planSlug: string; label: string }) {
  return (
    <Link href={`/cadastro?plano=${planSlug}`} className={buttonVariants({ className: "w-full" })}>
      {label}
    </Link>
  );
}
