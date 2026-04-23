import type { Database } from "@/lib/supabase/database.types";
import { requireViewer } from "@/lib/auth";
import { ExpensesClient } from "@/components/employee/expenses-client";

type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export default async function ExpensesPage() {
  const { profile, supabase } = await requireViewer();
  const [{ data: expenses }, { data: categories }] = await Promise.all([
    supabase
      .from("expenses")
      .select("id, amount, category_id, currency, description, expense_date, receipt_url, status")
      .eq("user_id", profile.id)
      .order("expense_date", { ascending: false }),
    supabase.from("categories").select("id, name").eq("is_active", true).order("name"),
  ]);

  const categoryMap = new Map(
    ((categories ?? []) as CategoryRow[]).map((category) => [category.id, category.name]),
  );
  const expenseRows = (expenses ?? []) as Pick<
    ExpenseRow,
    | "amount"
    | "category_id"
    | "currency"
    | "description"
    | "expense_date"
    | "id"
    | "receipt_url"
    | "status"
  >[];

  const receiptLinks = await Promise.all(
    expenseRows
      .filter((expense) => expense.receipt_url)
      .map(async (expense) => {
        const { data } = await supabase.storage
          .from("receipts")
          .createSignedUrl(expense.receipt_url!, 60 * 30);

        return [expense.id, data?.signedUrl ?? null] as const;
      }),
  );

  const receiptMap = new Map(receiptLinks);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
          My expenses
        </p>
        <h1 className="mt-4 font-heading text-4xl text-slate-950">
          Review, filter, and update your claims.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Pending expenses stay editable until someone reviews them. Once a claim
          is approved, rejected, or settled, it becomes a read-only record.
        </p>
      </section>

      <ExpensesClient
        categories={((categories ?? []) as CategoryRow[]).map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        initialExpenses={expenseRows.map((expense) => ({
          amount: expense.amount,
          categoryId: expense.category_id,
          categoryName: categoryMap.get(expense.category_id ?? "") ?? "Uncategorized",
          currency: expense.currency,
          description: expense.description,
          expenseDate: expense.expense_date,
          id: expense.id,
          receiptSignedUrl: receiptMap.get(expense.id) ?? null,
          status: expense.status as "Approved" | "Pending" | "Rejected" | "Settled",
        }))}
      />
    </div>
  );
}
