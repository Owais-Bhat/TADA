"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Search, XCircle } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";

type ApprovalExpense = {
  amount: number;
  categoryName: string;
  expenseDate: string;
  id: string;
  receiptSignedUrl: string | null;
  requesterName: string;
  status: "Pending";
  description: string | null;
};

export function ApprovalsClient({
  initialExpenses,
  reviewerId,
}: {
  initialExpenses: ApprovalExpense[];
  reviewerId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [decision, setDecision] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = expenses.filter((expense) => {
    const query = search.toLowerCase();
    return (
      !query ||
      expense.requesterName.toLowerCase().includes(query) ||
      expense.categoryName.toLowerCase().includes(query) ||
      (expense.description ?? "").toLowerCase().includes(query)
    );
  });

  async function handleDecision(expenseId: string, nextStatus: "Approved" | "Rejected") {
    setActionId(expenseId);
    setError(null);
    setMessage(null);

    const comment = decision[expenseId] || null;
    const approvalAction = nextStatus === "Approved" ? "approved" : "rejected";
    const updates: Database["public"]["Tables"]["expenses"]["Update"] = {
      status: nextStatus,
    };
    const approvalRecord: Database["public"]["Tables"]["approvals"]["Insert"] = {
      action: approvalAction,
      comment,
      expense_id: expenseId,
      reviewer_id: reviewerId,
    };

    const { error: updateError } = await supabase
      .from("expenses")
      .update(updates as never)
      .eq("id", expenseId);

    if (updateError) {
      setError(updateError.message);
      setActionId(null);
      return;
    }

    const { error: insertError } = await supabase
      .from("approvals")
      .insert(approvalRecord as never);

    if (insertError) {
      setError(insertError.message);
      setActionId(null);
      return;
    }

    setExpenses((current) => current.filter((expense) => expense.id !== expenseId));
    setMessage(`Expense ${nextStatus.toLowerCase()} successfully.`);
    setActionId(null);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee, category, or description"
          />
        </div>
        <Select value="Pending" disabled>
          <option>Pending</option>
        </Select>
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {filtered.length === 0 ? (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No pending approvals right now.
        </div>
      ) : null}

      <div className="space-y-4">
        {filtered.map((expense) => {
          const isPending = actionId === expense.id;

          return (
            <div
              key={expense.id}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-heading text-2xl text-slate-900">
                    {formatCurrency(expense.amount)}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {expense.requesterName} · {expense.categoryName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Expense date: {formatDate(expense.expenseDate)}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {expense.description || "No description provided."}
                  </p>
                  {expense.receiptSignedUrl ? (
                    <a
                      href={expense.receiptSignedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-sm font-medium text-violet-700 hover:text-violet-900"
                    >
                      Open receipt
                    </a>
                  ) : null}
                </div>

                <div className="w-full max-w-md rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">
                    Approval note
                  </p>
                  <Textarea
                    className="mt-3 bg-white"
                    value={decision[expense.id] ?? ""}
                    onChange={(e) =>
                      setDecision((current) => ({
                        ...current,
                        [expense.id]: e.target.value,
                      }))
                    }
                    placeholder="Optional note for the employee or finance log"
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      className="border border-emerald-200 bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                      disabled={isPending}
                      onClick={() => handleDecision(expense.id, "Approved")}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      className="border border-rose-200 bg-rose-100 text-rose-900 hover:bg-rose-200"
                      disabled={isPending}
                      onClick={() => handleDecision(expense.id, "Rejected")}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
