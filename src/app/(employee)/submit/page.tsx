import type { Database } from "@/lib/supabase/database.types";
import { requireViewer } from "@/lib/auth";
import { SubmitExpenseForm } from "@/components/employee/submit-expense-form";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export default async function SubmitPage() {
  const { profile, supabase } = await requireViewer();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
          Submit expense
        </p>
        <h1 className="mt-4 font-heading text-4xl text-slate-950">
          Send a new claim for review.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Add the amount, category, and date, then attach the receipt if you have
          one ready. New submissions enter the pending approval queue immediately.
        </p>
      </section>

      <SubmitExpenseForm
        categories={((categories ?? []) as CategoryRow[]).map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        userId={profile.id}
      />
    </div>
  );
}
