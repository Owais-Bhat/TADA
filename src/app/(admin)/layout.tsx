import type { ReactNode } from "react";
import { requireViewer } from "@/lib/auth";
import { canManageEmployees } from "@/lib/roles";
import { AuthenticatedShell } from "@/components/app/authenticated-shell";

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { profile } = await requireViewer({ admin: true });

  const navItems = [
    { href: "/admin/overview", label: "Overview" },
    { href: "/admin/approvals", label: "Approval Queue" },
  ];

  if (canManageEmployees(profile.role)) {
    navItems.push({ href: "/admin/employees", label: "Employees" });
  }

  return (
    <AuthenticatedShell
      portalLabel="Admin Portal"
      profile={profile}
      navItems={navItems}
    >
      {children}
    </AuthenticatedShell>
  );
}
