"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { buildProfileInsert, isProfileActive } from "@/lib/profile";
import { getRoleHome } from "@/lib/roles";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("We could not load your session. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    let profile = profileData as Pick<
      Database["public"]["Tables"]["profiles"]["Row"],
      "is_active" | "role"
    > | null;

    if (!profile) {
      const { data: insertedProfile, error: insertError } = await supabase
        .from("profiles")
        .insert(buildProfileInsert(user) as never)
        .select("role, is_active")
        .single();

      if (insertError) {
        await supabase.auth.signOut();
        setError(
          "We could not finish setting up your profile. Please run the latest Supabase schema and try again.",
        );
        setLoading(false);
        return;
      }

      profile = insertedProfile as Pick<
        Database["public"]["Tables"]["profiles"]["Row"],
        "is_active" | "role"
      >;
    }

    if (!isProfileActive(profile)) {
      await supabase.auth.signOut();
      setError("Your account is not active right now.");
      setLoading(false);
      return;
    }

    router.push(getRoleHome(profile.role));
    router.refresh();
  }

  return (
    <GlassCard
      className="w-full max-w-md border-emerald-400/14 bg-[#0b1715]/88 text-white shadow-2xl shadow-black/25"
      hover={false}
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/12">
          <ShieldCheck className="h-6 w-6 text-emerald-200" />
        </div>
        <h1 className="mb-2 font-heading text-3xl font-bold">
          <span className="grad-text">Welcome back</span>
        </h1>
        <p className="text-sm text-white/60">
          Sign in to manage expenses, approvals, and reimbursements.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/6"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/6"
          />
        </div>

        {error ? <p className="text-center text-sm text-rose-300">{error}</p> : null}

        <Button
          type="submit"
          className="w-full bg-emerald-500 text-white hover:bg-emerald-400"
          disabled={loading}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-emerald-200 hover:underline">
          Sign up
        </Link>
      </p>
    </GlassCard>
  );
}
