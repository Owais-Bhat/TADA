import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { getRoleHome } from "@/lib/roles";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const { profile } = await getViewer();

  if (profile) {
    redirect(getRoleHome(profile.role));
  }

  return (
    <main className="flex min-h-screen items-center px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="glass-panel rounded-[2.5rem] p-8 sm:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
            Supabase onboarding
          </p>
          <h1 className="mt-5 max-w-xl font-heading text-5xl font-bold leading-tight">
            Create an ExpenseFlow account and start from the employee side.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
            New users start as regular employees by default. Once signed in, your
            profile is created in Supabase and the app can promote you into
            manager, HR, finance, or super admin roles later.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full border border-slate-200 bg-white/88 px-4 py-2">
              Auth + profiles
            </span>
            <span className="rounded-full border border-slate-200 bg-white/88 px-4 py-2">
              Role-based routing
            </span>
            <span className="rounded-full border border-slate-200 bg-white/88 px-4 py-2">
              Receipt storage ready
            </span>
          </div>
        </section>

        <div className="flex items-center justify-center">
          <div className="w-full">
            <RegisterForm />
            <p className="mt-6 text-center text-sm text-slate-500">
              Already signed up?{" "}
              <Link href="/auth/login" className="text-emerald-700 hover:underline">
                Go to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
