"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ShieldCheck, Wallet } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/auth/sign-out-button";

type NavItem = {
  href: string;
  label: string;
};

type AuthenticatedShellProps = {
  children: ReactNode;
  navItems: NavItem[];
  profile: Pick<Database["public"]["Tables"]["profiles"]["Row"], "email" | "name" | "role">;
  portalLabel: string;
};

export function AuthenticatedShell({
  children,
  navItems,
  profile,
  portalLabel,
}: AuthenticatedShellProps) {
  const pathname = usePathname();

  return (
    <div className="page-shell px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl flex-col gap-3 xl:grid xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-4">
        <aside className="glass-panel soft-grid rounded-[2rem] px-4 py-5 text-white sm:px-5 sm:py-6 xl:sticky xl:top-5 xl:self-start">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/12">
              {portalLabel === "Admin Portal" ? (
                <ShieldCheck className="h-6 w-6 text-emerald-200" />
              ) : (
                <Wallet className="h-6 w-6 text-emerald-200" />
              )}
            </div>
            <div>
              <p className="font-heading text-xl">ExpenseFlow</p>
              <p className="text-sm text-white/62">{portalLabel}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 xl:mt-8">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/42">
                Signed in as
              </p>
              <p className="mt-3 break-words font-heading text-lg">{profile.name}</p>
              <p className="mt-1 break-all text-sm text-white/62">{profile.email}</p>
              <Badge
                className="mt-4 border-emerald-300/20 bg-emerald-400/12 text-emerald-100"
                variant="outline"
              >
                {profile.role}
              </Badge>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-2 xl:overflow-visible xl:pb-0">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "min-w-max rounded-2xl border px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors xl:block xl:min-w-0",
                      isActive
                        ? "border-emerald-300/25 bg-emerald-500 text-white shadow-lg shadow-emerald-950/30"
                        : "border-white/5 bg-white/5 text-white/76 hover:border-white/10 hover:bg-white/10",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="xl:mt-2">
              <SignOutButton />
            </div>
          </div>
        </aside>

        <div className="page-surface min-w-0 rounded-[2rem] p-4 sm:p-5 lg:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}
