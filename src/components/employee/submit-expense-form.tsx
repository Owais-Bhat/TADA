"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Receipt } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CategoryOption = {
  id: string;
  name: string;
};

export function SubmitExpenseForm({
  categories,
  userId,
}: {
  categories: CategoryOption[];
  userId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let receiptPath: string | null = null;

    if (file) {
      const isAllowedType =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "application/pdf" ||
        file.type === "image/webp";

      if (!isAllowedType) {
        setError("Please upload a JPG, PNG, WEBP, or PDF receipt.");
        setLoading(false);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("Receipt files must stay under 10MB.");
        setLoading(false);
        return;
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      receiptPath = `${userId}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(receiptPath, file, {
          upsert: false,
        });

      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }
    }

    const { error: insertError } = await supabase.from("expenses").insert({
      amount: Number(amount),
      category_id: categoryId || null,
      description: description || null,
      expense_date: expenseDate,
      receipt_url: receiptPath,
      user_id: userId,
    } as Database["public"]["Tables"]["expenses"]["Insert"] as never);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/expenses");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2"
    >
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1250"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Choose a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-date">Expense date</Label>
        <Input
          id="expense-date"
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="receipt">Receipt</Label>
        <Input
          id="receipt"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,.webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="pt-2"
        />
      </div>

      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Team offsite taxi, dinner with client, office monitor, etc."
        />
      </div>

      <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-600 lg:col-span-2">
        <div className="flex items-center gap-2 font-medium text-slate-900">
          <Receipt className="h-4 w-4" />
          Receipt tips
        </div>
        <p className="mt-2 leading-7">
          Upload a JPG, PNG, WEBP, or PDF file. Private Supabase storage keeps it
          protected, and the app uses signed links when the receipt needs to be
          viewed later.
        </p>
      </div>

      {error ? <p className="text-sm text-rose-700 lg:col-span-2">{error}</p> : null}

      <div className="lg:col-span-2">
        <Button
          type="submit"
          className="border border-violet-200 bg-violet-100 text-violet-950 hover:bg-violet-200"
          disabled={loading}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          {loading ? "Submitting..." : "Submit expense"}
        </Button>
      </div>
    </form>
  );
}
