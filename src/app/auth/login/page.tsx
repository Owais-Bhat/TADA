import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { getRoleHome } from "@/lib/roles";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const { profile } = await getViewer();

  if (profile) {
    redirect(getRoleHome(profile.role));
  }

  return (
    <main className="flex min-h-screen items-center px-4 py-8 text-white sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="glass-panel rounded-[2.5rem] p-8 sm:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-white/50">
            Employee and admin access
          </p>
          <h1 className="mt-5 max-w-xl font-heading text-5xl font-bold leading-tight">
            Sign in to keep claims moving from submission to reimbursement.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/68">
            Use your work account to enter the employee workspace or the admin
            review portal. Supabase handles the session, while ExpenseFlow routes
            you to the right dashboard for your role.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/62">
            <span className="rounded-full border border-white/12 bg-white/6 px-4 py-2">
              Receipt uploads
            </span>
            <span className="rounded-full border border-white/12 bg-white/6 px-4 py-2">
              Approval queues
            </span>
            <span className="rounded-full border border-white/12 bg-white/6 px-4 py-2">
              Role-aware access
            </span>
          </div>
        </section>

        <div className="flex items-center justify-center">
          <div className="w-full">
            <LoginForm />
            <p className="mt-6 text-center text-sm text-white/60">
              Back to{" "}
              <Link href="/" className="text-emerald-200 hover:underline">
                the landing page
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
