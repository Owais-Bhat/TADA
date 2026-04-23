import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CreditCard,
  FileClock,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { getViewer } from "@/lib/auth";
import { getRoleHome } from "@/lib/roles";

const features = [
  {
    icon: Wallet,
    title: "Employee workflow",
    description:
      "Submit expenses, track status, and keep every receipt attached to the right claim.",
  },
  {
    icon: ShieldCheck,
    title: "Admin workflow",
    description:
      "Review pending claims, manage employees, and keep approvals moving without leaving the dashboard.",
  },
  {
    icon: BellRing,
    title: "Supabase-backed core",
    description:
      "Auth, Postgres, and Storage stay in one stack so the MVP stays simple and production-ready.",
  },
];

export default async function Home() {
  const { profile } = await getViewer();
  const primaryHref = profile ? getRoleHome(profile.role) : "/auth/login";
  const primaryLabel = profile ? "Open workspace" : "Sign in";

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-slate-950 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.32),transparent_28%),radial-gradient(circle_at_75%_20%,rgba(52,211,153,0.2),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(96,165,250,0.12),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-0 soft-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl">
        <section className="glass-panel rounded-[2.5rem] px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
                ExpenseFlow MVP
              </p>
              <h1 className="mt-4 max-w-4xl font-heading text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
                Expense management for teams that need less friction and better
                visibility.
              </h1>
            </div>
            <div className="rounded-full border border-slate-200 bg-white/88 px-4 py-2 text-sm text-slate-600">
              Built with Next.js 16 + Supabase
            </div>
          </div>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600">
            A dual-portal experience for employees and finance teams: submit
            receipts, follow approval status, and keep admin review clean and
            fast from one shared product.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={primaryHref}
              className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-violet-100"
            >
              {primaryLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            {!profile ? (
              <Link
                href="/auth/register"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white/88 px-6 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
              >
                Create account
              </Link>
            ) : null}
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-[1.75rem] border border-slate-200 bg-white/88 p-5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
                    <Icon className="h-6 w-6 text-violet-700" />
                  </div>
                  <h2 className="mt-4 font-heading text-2xl">{feature.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="glass-panel rounded-[2rem] p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/12">
                <Wallet className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <p className="font-heading text-2xl">Employee Portal</p>
                <p className="text-sm text-slate-500">
                  Built for personal expense claims.
                </p>
              </div>
            </div>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
              <li>Submit a new expense with category, amount, date, and receipt.</li>
              <li>Track pending, approved, rejected, and settled totals this month.</li>
              <li>Filter your claim history and update pending items before review.</li>
            </ul>
          </div>

          <div className="glass-panel rounded-[2rem] p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/12">
                <ShieldCheck className="h-6 w-6 text-violet-700" />
              </div>
              <div>
                <p className="font-heading text-2xl">Admin Portal</p>
                <p className="text-sm text-slate-500">
                  Designed for managers and finance teams.
                </p>
              </div>
            </div>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
              <li>Review the approval queue and action claims with notes.</li>
              <li>Monitor monthly spend, pending volume, and active employees.</li>
              <li>Manage employee roles, department assignment, and active status.</li>
            </ul>
          </div>
        </section>

        <section className="mt-6 grid gap-6 pb-6 md:grid-cols-3">
          <div className="glass-panel rounded-[2rem] p-6">
            <BarChart3 className="h-6 w-6 text-sky-700" />
            <p className="mt-4 font-heading text-2xl">Live-ready data model</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Profiles, expenses, approvals, notifications, settlements, and
              departments already map cleanly to the Supabase schema in this repo.
            </p>
          </div>
          <div className="glass-panel rounded-[2rem] p-6">
            <FileClock className="h-6 w-6 text-amber-700" />
            <p className="mt-4 font-heading text-2xl">Approval-first flow</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Keep the MVP focused on what matters most: submission, review,
              status visibility, and clear ownership across roles.
            </p>
          </div>
          <div className="glass-panel rounded-[2rem] p-6">
            <CreditCard className="h-6 w-6 text-emerald-700" />
            <p className="mt-4 font-heading text-2xl">Receipt storage included</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Private Supabase storage keeps uploaded receipts protected while
              signed URLs let approved viewers open them safely.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
