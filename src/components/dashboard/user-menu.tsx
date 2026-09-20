"use client";

import { signOut } from "next-auth/react";
import { ArrowUpCircle, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initialsFrom(email: string, name: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function UserMenu({
  email,
  name,
  planName,
  isManagedAccount = false,
}: {
  email: string;
  name: string | null;
  planName: string | null;
  isManagedAccount?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none">
        <Avatar className="size-8">
          <AvatarFallback>{initialsFrom(email, name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium">{name || email}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">{email}</span>
            {planName && (
              <span className="mt-1 w-fit rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Plano {planName}
              </span>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        {!isManagedAccount && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<a href="/app/billing" className="cursor-pointer" />}>
              <ArrowUpCircle />
              Upgrade
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer"
        >
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
