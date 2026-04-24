import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/lib/supabase/database.types";
import { requireViewer } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export default async function DashboardPage() {
  const { profile, supabase } = await requireViewer();
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartIso = monthStart.toISOString().slice(0, 10);

  const [{ data: monthlyExpenses }, { data: recentExpenses }, { data: categories }] =
    await Promise.all([
      supabase
        .from("expenses")
        .select("amount, currency, status, expense_date")
        .eq("user_id", profile.id)
        .gte("expense_date", monthStartIso),
      supabase
        .from("expenses")
        .select("id, amount, currency, status, expense_date, description, category_id")
        .eq("user_id", profile.id)
        .order("expense_date", { ascending: false })
        .limit(5),
      supabase.from("categories").select("id, name"),
    ]);

  const categoryMap = new Map(
    ((categories ?? []) as CategoryRow[]).map((category) => [category.id, category.name]),
  );
  const currentMonth = (monthlyExpenses ?? []) as Pick<
    ExpenseRow,
    "amount" | "currency" | "expense_date" | "status"
  >[];
  const recent = (recentExpenses ?? []) as Pick<
    ExpenseRow,
    "amount" | "category_id" | "currency" | "description" | "expense_date" | "id" | "status"
  >[];

  const pending = currentMonth.filter((expense) => expense.status === "Pending");
  const approved = currentMonth.filter((expense) => expense.status === "Approved");
  const rejected = currentMonth.filter((expense) => expense.status === "Rejected");
  const settled = currentMonth.filter((expense) => expense.status === "Settled");

  const cards = [
    {
      label: "Pending this month",
      value: formatCurrency(
        pending.reduce((sum, expense) => sum + expense.amount, 0),
        currentMonth[0]?.currency ?? "USD",
      ),
    },
    {
      label: "Approved this month",
      value: formatCurrency(
        approved.reduce((sum, expense) => sum + expense.amount, 0),
        currentMonth[0]?.currency ?? "USD",
      ),
    },
    {
      label: "Rejected this month",
      value: formatCurrency(
        rejected.reduce((sum, expense) => sum + expense.amount, 0),
        currentMonth[0]?.currency ?? "USD",
      ),
    },
    {
      label: "Settled this month",
      value: formatCurrency(
        settled.reduce((sum, expense) => sum + expense.amount, 0),
        currentMonth[0]?.currency ?? "USD",
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-emerald-400/14 bg-[#0c1816] px-6 py-8 text-white shadow-lg shadow-black/20">
        <p className="text-sm uppercase tracking-[0.18em] text-white/45">
          Employee dashboard
        </p>
        <h1 className="mt-4 font-heading text-4xl">
          Welcome back, {profile.name.split(" ")[0]}.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
          Track how much you have claimed this month, review the latest expense
          status changes, and submit your next receipt when you are ready.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-[1.75rem] border border-white/10 bg-[#0c1916] p-5 shadow-lg shadow-black/20"
          >
            <p className="text-sm text-white/52">{card.label}</p>
            <p className="mt-3 font-heading text-3xl text-white">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-[#0c1916] p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading text-2xl text-white">Recent expenses</p>
              <p className="mt-1 text-sm text-white/52">
                Your five most recent claims.
              </p>
            </div>
            <Link
              href="/expenses"
              className="inline-flex items-center text-sm font-medium text-emerald-200 hover:text-emerald-100"
            >
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {recent.length === 0 ? (
              <p className="text-sm text-white/52">
                No expenses yet. Your new submissions will show up here.
              </p>
            ) : (
              recent.map((expense) => (
                <div
                  key={expense.id}
                  className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">
                        {categoryMap.get(expense.category_id ?? "") ?? "Uncategorized"}
                      </p>
                      <p className="mt-1 text-sm text-white/52">
                        {formatDate(expense.expense_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-2xl text-white">
                        {formatCurrency(expense.amount, expense.currency ?? "USD")}
                      </p>
                      <p className="text-sm text-white/52">{expense.status}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/68">
                    {expense.description || "No description provided."}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-[#0c1916] p-5 shadow-lg shadow-black/20">
          <p className="font-heading text-2xl text-white">Quick actions</p>
          <div className="mt-5 space-y-3">
            <Link
              href="/submit"
              className="block rounded-[1.5rem] border border-emerald-300/18 bg-emerald-500/18 px-5 py-4 text-white transition hover:bg-emerald-500/26"
            >
              <p className="font-medium">Submit a new expense</p>
              <p className="mt-1 text-sm text-white/70">
                Upload a receipt and create a claim in one step.
              </p>
            </Link>
            <Link
              href="/expenses"
              className="block rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/10"
            >
              <p className="font-medium text-white">Review my history</p>
              <p className="mt-1 text-sm text-white/56">
                Filter past submissions and adjust pending claims.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
