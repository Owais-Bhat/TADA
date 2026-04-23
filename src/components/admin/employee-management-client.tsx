"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Search } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type DepartmentOption = {
  id: string;
  name: string;
};

type EmployeeItem = {
  departmentId: string | null;
  departmentName: string;
  email: string;
  id: string;
  isActive: boolean;
  name: string;
  role: string;
};

type DraftState = {
  departmentId: string;
  isActive: boolean;
  role: string;
};

export function EmployeeManagementClient({
  departments,
  initialEmployees,
}: {
  departments: DepartmentOption[];
  initialEmployees: EmployeeItem[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [employees, setEmployees] = useState(initialEmployees);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [drafts, setDrafts] = useState<Record<string, DraftState>>(() =>
    Object.fromEntries(
      initialEmployees.map((employee) => [
        employee.id,
        {
          departmentId: employee.departmentId ?? "",
          isActive: employee.isActive,
          role: employee.role,
        },
      ]),
    ),
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = employees.filter((employee) => {
    const matchesQuery =
      !query ||
      employee.name.toLowerCase().includes(query.toLowerCase()) ||
      employee.email.toLowerCase().includes(query.toLowerCase()) ||
      employee.departmentName.toLowerCase().includes(query.toLowerCase());
    const matchesRole =
      roleFilter === "All" || employee.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  async function handleSave(employeeId: string) {
    setSavingId(employeeId);
    setError(null);
    setMessage(null);

    const draft = drafts[employeeId];
    const updates: Database["public"]["Tables"]["profiles"]["Update"] = {
      department_id: draft.departmentId || null,
      is_active: draft.isActive,
      role: draft.role,
    };

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updates as never)
      .eq("id", employeeId);

    if (updateError) {
      setError(updateError.message);
      setSavingId(null);
      return;
    }

    const department = departments.find(
      (item) => item.id === (draft.departmentId || null),
    );

    setEmployees((current) =>
      current.map((employee) =>
        employee.id === employeeId
          ? {
              ...employee,
              departmentId: draft.departmentId || null,
              departmentName: department?.name ?? "Unassigned",
              isActive: draft.isActive,
              role: draft.role,
            }
          : employee,
      ),
    );
    setSavingId(null);
    setMessage("Employee updated.");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or department"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="All">All roles</option>
          <option value="Regular">Regular</option>
          <option value="Manager">Manager</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="SuperAdmin">SuperAdmin</option>
        </Select>
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <div className="space-y-4">
        {filtered.map((employee) => {
          const draft = drafts[employee.id];
          const isSaving = savingId === employee.id;

          return (
            <div
              key={employee.id}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr_0.9fr_0.7fr_auto] xl:items-center">
                <div>
                  <p className="font-heading text-xl text-slate-900">{employee.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{employee.email}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge className="bg-slate-100 text-slate-700">
                      {employee.departmentName}
                    </Badge>
                    <Badge
                      className={
                        employee.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }
                    >
                      {employee.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <Select
                  value={draft.role}
                  onChange={(e) =>
                    setDrafts((current) => ({
                      ...current,
                      [employee.id]: {
                        ...current[employee.id],
                        role: e.target.value,
                      },
                    }))
                  }
                >
                  <option value="Regular">Regular</option>
                  <option value="Manager">Manager</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="SuperAdmin">SuperAdmin</option>
                </Select>

                <Select
                  value={draft.departmentId}
                  onChange={(e) =>
                    setDrafts((current) => ({
                      ...current,
                      [employee.id]: {
                        ...current[employee.id],
                        departmentId: e.target.value,
                      },
                    }))
                  }
                >
                  <option value="">Unassigned</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </Select>

                <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(e) =>
                      setDrafts((current) => ({
                        ...current,
                        [employee.id]: {
                          ...current[employee.id],
                          isActive: e.target.checked,
                        },
                      }))
                    }
                  />
                  Active
                </label>

                <Button
                  className="border border-violet-200 bg-violet-100 text-violet-950 hover:bg-violet-200"
                  disabled={isSaving}
                  onClick={() => handleSave(employee.id)}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
