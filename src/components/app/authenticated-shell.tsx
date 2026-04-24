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
    <div className="page-shell px-4 py-4 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="glass-panel soft-grid rounded-[2rem] px-5 py-6 text-white">
          <div className="flex items-center gap-3">
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

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/42">
              Signed in as
            </p>
            <p className="mt-3 font-heading text-lg">{profile.name}</p>
            <p className="mt-1 text-sm text-white/62">{profile.email}</p>
            <Badge
              className="mt-4 border-emerald-300/20 bg-emerald-400/12 text-emerald-100"
              variant="outline"
            >
              {profile.role}
            </Badge>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-2xl border px-4 py-3 text-sm font-medium transition-colors",
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

          <div className="mt-8">
            <SignOutButton />
          </div>
        </aside>

        <div className="page-surface rounded-[2rem] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
