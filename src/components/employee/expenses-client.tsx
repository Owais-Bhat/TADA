"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, FileText, Pencil, Save, Trash2 } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ExpenseStatus = "Pending" | "Approved" | "Rejected" | "Settled";

type ExpenseItem = {
  amount: number;
  categoryId: string | null;
  categoryName: string;
  currency: string | null;
  description: string | null;
  expenseDate: string;
  id: string;
  receiptSignedUrl: string | null;
  status: ExpenseStatus;
};

type CategoryOption = {
  id: string;
  name: string;
};

const statusClasses: Record<ExpenseStatus, string> = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-100 text-rose-700 border-rose-200",
  Settled: "bg-sky-100 text-sky-700 border-sky-200",
};

export function ExpensesClient({
  categories,
  initialExpenses,
}: {
  categories: CategoryOption[];
  initialExpenses: ExpenseItem[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    amount: "",
    categoryId: "",
    description: "",
    expenseDate: "",
  });
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      !search ||
      expense.categoryName.toLowerCase().includes(search.toLowerCase()) ||
      (expense.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || expense.status === statusFilter;
    const matchesCategory =
      categoryFilter === "All" || expense.categoryId === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  function startEditing(expense: ExpenseItem) {
    setEditingId(expense.id);
    setDraft({
      amount: String(expense.amount),
      categoryId: expense.categoryId ?? "",
      description: expense.description ?? "",
      expenseDate: expense.expenseDate,
    });
    setExpandedId(expense.id);
    setMessage(null);
    setError(null);
  }

  async function handleDelete(expenseId: string) {
    if (!window.confirm("Delete this pending expense?")) {
      return;
    }

    setPendingId(expenseId);
    setError(null);
    const { error: deleteError } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId);

    if (deleteError) {
      setError(deleteError.message);
      setPendingId(null);
      return;
    }

    setExpenses((current) => current.filter((expense) => expense.id !== expenseId));
    setPendingId(null);
    setMessage("Expense removed.");
    router.refresh();
  }

  async function handleSave(expenseId: string) {
    setPendingId(expenseId);
    setError(null);

    const category = categories.find((item) => item.id === draft.categoryId);
    const updates: Database["public"]["Tables"]["expenses"]["Update"] = {
      amount: Number(draft.amount),
      category_id: draft.categoryId || null,
      description: draft.description || null,
      expense_date: draft.expenseDate,
    };

    const { error: updateError } = await supabase
      .from("expenses")
      .update(updates as never)
      .eq("id", expenseId);

    if (updateError) {
      setError(updateError.message);
      setPendingId(null);
      return;
    }

    setExpenses((current) =>
      current.map((expense) =>
        expense.id === expenseId
          ? {
              ...expense,
              amount: Number(draft.amount),
              categoryId: draft.categoryId || null,
              categoryName: category?.name ?? "Uncategorized",
              description: draft.description || null,
              expenseDate: draft.expenseDate,
            }
          : expense,
      ),
    );
    setEditingId(null);
    setPendingId(null);
    setMessage("Expense updated.");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.6fr_0.6fr]">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by category or description"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
          <option>Settled</option>
        </Select>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {filteredExpenses.length === 0 ? (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No expenses match your filters yet.
        </div>
      ) : null}

      <div className="space-y-4">
        {filteredExpenses.map((expense) => {
          const isEditing = editingId === expense.id;
          const isExpanded = expandedId === expense.id;
          const isPendingAction = pendingId === expense.id;

          return (
            <div
              key={expense.id}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-heading text-2xl text-slate-900">
                      {formatCurrency(expense.amount, expense.currency ?? "USD")}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn("border px-3 py-1", statusClasses[expense.status])}
                    >
                      {expense.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {expense.categoryName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Submitted for {formatDate(expense.expenseDate)}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {expense.description || "No description provided."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    className="bg-slate-100 text-slate-800 hover:bg-slate-200"
                    onClick={() =>
                      setExpandedId((current) =>
                        current === expense.id ? null : expense.id,
                      )
                    }
                  >
                    <ChevronDown className="mr-2 h-4 w-4" />
                    {isExpanded ? "Hide details" : "Details"}
                  </Button>
                  {expense.status === "Pending" ? (
                    <>
                      <Button
                        className="bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-100"
                        onClick={() => startEditing(expense)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        className="bg-rose-50 text-rose-700 hover:bg-rose-100"
                        disabled={isPendingAction}
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>

              {isExpanded ? (
                <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
                  {isEditing ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`amount-${expense.id}`}>Amount</Label>
                        <Input
                          id={`amount-${expense.id}`}
                          type="number"
                          value={draft.amount}
                          onChange={(e) =>
                            setDraft((current) => ({
                              ...current,
                              amount: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`category-${expense.id}`}>Category</Label>
                        <Select
                          id={`category-${expense.id}`}
                          value={draft.categoryId}
                          onChange={(e) =>
                            setDraft((current) => ({
                              ...current,
                              categoryId: e.target.value,
                            }))
                          }
                        >
                          <option value="">Uncategorized</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`date-${expense.id}`}>Expense date</Label>
                        <Input
                          id={`date-${expense.id}`}
                          type="date"
                          value={draft.expenseDate}
                          onChange={(e) =>
                            setDraft((current) => ({
                              ...current,
                              expenseDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`description-${expense.id}`}>
                          Description
                        </Label>
                        <Textarea
                          id={`description-${expense.id}`}
                          value={draft.description}
                          onChange={(e) =>
                            setDraft((current) => ({
                              ...current,
                              description: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex gap-2 md:col-span-2">
                        <Button
                          className="border border-violet-200 bg-violet-100 text-violet-950 hover:bg-violet-200"
                          disabled={isPendingAction}
                          onClick={() => handleSave(expense.id)}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save changes
                        </Button>
                        <Button
                          className="bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-100"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium text-slate-900">Category:</span>{" "}
                          {expense.categoryName}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">Status:</span>{" "}
                          {expense.status}
                        </p>
                      </div>
                      {expense.receiptSignedUrl ? (
                        <a
                          href={expense.receiptSignedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-sm font-medium text-violet-700 hover:text-violet-900"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Open receipt
                        </a>
                      ) : (
                        <p className="text-sm text-slate-500">No receipt uploaded</p>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
