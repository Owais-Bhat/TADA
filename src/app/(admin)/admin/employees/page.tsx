import type { Database } from "@/lib/supabase/database.types";
import { requireViewer } from "@/lib/auth";
import { EMPLOYEE_MANAGEMENT_ROLES } from "@/lib/roles";
import { EmployeeManagementClient } from "@/components/admin/employee-management-client";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type DepartmentRow = Database["public"]["Tables"]["departments"]["Row"];

export default async function EmployeesPage() {
  const { supabase } = await requireViewer({ roles: EMPLOYEE_MANAGEMENT_ROLES });
  const [{ data: employees }, { data: departments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name, email, role, is_active, department_id")
      .order("name"),
    supabase.from("departments").select("id, name").order("name"),
  ]);

  const departmentMap = new Map(
    ((departments ?? []) as DepartmentRow[]).map((department) => [
      department.id,
      department.name,
    ]),
  );

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
          Employee management
        </p>
        <h1 className="mt-4 font-heading text-4xl text-slate-950">
          Manage employee access and team structure.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Assign roles, move people between departments, and deactivate accounts
          when access should stop. Changes save directly back to Supabase.
        </p>
      </section>

      <EmployeeManagementClient
        departments={((departments ?? []) as DepartmentRow[]).map((department) => ({
          id: department.id,
          name: department.name,
        }))}
        initialEmployees={((employees ?? []) as ProfileRow[]).map((employee) => ({
          departmentId: employee.department_id,
          departmentName:
            departmentMap.get(employee.department_id ?? "") ?? "Unassigned",
          email: employee.email,
          id: employee.id,
          isActive: employee.is_active ?? false,
          name: employee.name,
          role: employee.role,
        }))}
      />
    </div>
  );
}
