import type { ReactNode } from "react";
import { requireViewer } from "@/lib/auth";
import { AuthenticatedShell } from "@/components/app/authenticated-shell";

export default async function EmployeeLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { profile } = await requireViewer();

  return (
    <AuthenticatedShell
      portalLabel="Employee Portal"
      profile={profile}
      navItems={[
        { href: "/dashboard", label: "Dashboard" },
        { href: "/expenses", label: "My Expenses" },
        { href: "/submit", label: "Submit Expense" },
      ]}
    >
      {children}
    </AuthenticatedShell>
  );
}
