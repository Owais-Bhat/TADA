import type { Database } from "@/lib/supabase/database.types";
import { requireViewer } from "@/lib/auth";
import { ApprovalsClient } from "@/components/admin/approvals-client";

type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export default async function ApprovalsPage() {
  const { profile, supabase } = await requireViewer({ admin: true });
  const [{ data: expenses }, { data: categories }, { data: profiles }] =
    await Promise.all([
      supabase
        .from("expenses")
        .select("id, amount, category_id, description, expense_date, receipt_url, status, user_id")
        .eq("status", "Pending")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name"),
      supabase.from("profiles").select("id, name"),
    ]);

  const categoryMap = new Map(
    ((categories ?? []) as CategoryRow[]).map((category) => [category.id, category.name]),
  );
  const profileMap = new Map(
    ((profiles ?? []) as ProfileRow[]).map((item) => [item.id, item.name]),
  );

  const expenseRows = (expenses ?? []) as Pick<
    ExpenseRow,
    | "amount"
    | "category_id"
    | "description"
    | "expense_date"
    | "id"
    | "receipt_url"
    | "status"
    | "user_id"
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
        <p className="text-sm uppercase tracking-[0.18em] text-white/48">
          Approval queue
        </p>
        <h1 className="mt-4 font-heading text-4xl text-white">
          Review pending claims and keep reimbursement moving.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">
          Every pending expense lands here for action. Add a note when needed and
          approve or reject each claim directly from the queue.
        </p>
      </section>

      <ApprovalsClient
        reviewerId={profile.id}
        initialExpenses={expenseRows.map((expense) => ({
          amount: expense.amount,
          categoryName: categoryMap.get(expense.category_id ?? "") ?? "Uncategorized",
          description: expense.description,
          expenseDate: expense.expense_date,
          id: expense.id,
          receiptSignedUrl: receiptMap.get(expense.id) ?? null,
          requesterName: profileMap.get(expense.user_id) ?? "Unknown employee",
          status: "Pending" as const,
        }))}
      />
    </div>
  );
}
