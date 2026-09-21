"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const BASE_NAV_ITEMS = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/history", label: "Histórico" },
] as const;

const PROJECTS_NAV_ITEM = { href: "/app/projects", label: "Projetos" } as const;

export function MainNav({ showProjects = false }: { showProjects?: boolean }) {
  const pathname = usePathname();
  const navItems = showProjects ? [...BASE_NAV_ITEMS, PROJECTS_NAV_ITEM] : BASE_NAV_ITEMS;

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
