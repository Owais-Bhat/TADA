import type { Database } from "@/lib/supabase/database.types";
import { requireViewer } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type DepartmentRow = Database["public"]["Tables"]["departments"]["Row"];

export default async function OverviewPage() {
  const { supabase } = await requireViewer({ admin: true });
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartIso = monthStart.toISOString().slice(0, 10);

  const [
    { data: activeEmployees },
    { data: pendingExpenses },
    { data: monthExpenses },
    { data: categories },
    { data: departments },
  ] = await Promise.all([
    supabase.from("profiles").select("id, department_id").eq("is_active", true),
    supabase.from("expenses").select("id, amount").eq("status", "Pending"),
    supabase
      .from("expenses")
      .select("amount, category_id, user_id")
      .gte("expense_date", monthStartIso),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("departments").select("id, name, monthly_budget").order("name"),
  ]);

  const employees = (activeEmployees ?? []) as Pick<
    ProfileRow,
    "department_id" | "id"
  >[];
  const pending = (pendingExpenses ?? []) as Pick<ExpenseRow, "amount" | "id">[];
  const monthRows = (monthExpenses ?? []) as Pick<
    ExpenseRow,
    "amount" | "category_id" | "user_id"
  >[];
  const categoryRows = (categories ?? []) as Pick<CategoryRow, "id" | "name">[];
  const departmentRows = (departments ?? []) as Pick<
    DepartmentRow,
    "id" | "monthly_budget" | "name"
  >[];

  const employeeDepartmentMap = new Map(
    employees.map((employee) => [employee.id, employee.department_id]),
  );

  const categoryTotals = categoryRows
    .map((category) => ({
      name: category.name,
      total: monthRows
        .filter((expense) => expense.category_id === category.id)
        .reduce((sum, expense) => sum + expense.amount, 0),
    }))
    .sort((left, right) => right.total - left.total)
    .slice(0, 4);

  const departmentTotals = departmentRows
    .map((department) => ({
      budget: department.monthly_budget ?? 0,
      name: department.name,
      spend: monthRows
        .filter(
          (expense) => employeeDepartmentMap.get(expense.user_id) === department.id,
        )
        .reduce((sum, expense) => sum + expense.amount, 0),
    }))
    .sort((left, right) => right.spend - left.spend)
    .slice(0, 4);

  const cards = [
    { label: "Pending approvals", value: String(pending.length) },
    {
      label: "Pending amount",
      value: formatCurrency(pending.reduce((sum, item) => sum + item.amount, 0)),
    },
    { label: "Active employees", value: String(employees.length) },
    {
      label: "Monthly spend",
      value: formatCurrency(
        monthRows.reduce((sum, expense) => sum + expense.amount, 0),
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white/92 px-6 py-8 text-slate-950 shadow-sm">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
          Admin overview
        </p>
        <h1 className="mt-4 font-heading text-4xl">
          Review approval volume and team spend at a glance.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          This is the control surface for managers, HR, and finance users. It
          keeps the current month readable without forcing you into a dense report
          view too early.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 font-heading text-3xl text-slate-950">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-heading text-2xl text-slate-950">Top categories</p>
          <div className="mt-5 space-y-3">
            {categoryTotals.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-[1.25rem] bg-slate-50 px-4 py-3"
              >
                <p className="text-sm font-medium text-slate-700">{item.name}</p>
                <p className="font-heading text-xl text-slate-950">
                  {formatCurrency(item.total)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-heading text-2xl text-slate-950">Department snapshot</p>
          <div className="mt-5 space-y-3">
            {departmentTotals.map((department) => (
              <div
                key={department.name}
                className="rounded-[1.25rem] bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">
                    {department.name}
                  </p>
                  <p className="font-heading text-xl text-slate-950">
                    {formatCurrency(department.spend)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Budget: {formatCurrency(department.budget)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
