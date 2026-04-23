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
        <aside className="glass-panel soft-grid rounded-[2rem] px-5 py-6 text-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              {portalLabel === "Admin Portal" ? (
                <ShieldCheck className="h-6 w-6 text-violet-700" />
              ) : (
                <Wallet className="h-6 w-6 text-emerald-700" />
              )}
            </div>
            <div>
              <p className="font-heading text-xl">ExpenseFlow</p>
              <p className="text-sm text-slate-500">{portalLabel}</p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white/88 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Signed in as
            </p>
            <p className="mt-3 font-heading text-lg">{profile.name}</p>
            <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
            <Badge
              className="mt-4 border-violet-200 bg-violet-50 text-violet-800"
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
                      ? "border-violet-200 bg-violet-100 text-violet-950 shadow-sm"
                      : "border-transparent bg-slate-100/75 text-slate-700 hover:border-slate-200 hover:bg-white",
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
