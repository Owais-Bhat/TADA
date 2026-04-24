"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { buildProfileInsert } from "@/lib/profile";
import { getRoleHome } from "@/lib/roles";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.session || !data.user) {
      setMessage("Account created. Check your email to verify your account.");
      setLoading(false);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    let profile = profileData as Pick<
      Database["public"]["Tables"]["profiles"]["Row"],
      "role"
    > | null;

    if (!profile) {
      const { data: insertedProfile, error: insertError } = await supabase
        .from("profiles")
        .insert(buildProfileInsert(data.user) as never)
        .select("role")
        .single();

      if (insertError) {
        setError(
          "Account created, but profile setup is incomplete. Please run the latest Supabase schema and sign in again.",
        );
        setLoading(false);
        return;
      }

      profile = insertedProfile as Pick<
        Database["public"]["Tables"]["profiles"]["Row"],
        "role"
      >;
    }

    router.push(getRoleHome(profile?.role ?? "Regular"));
    router.refresh();
  }

  return (
    <GlassCard
      className="w-full max-w-md border-emerald-400/14 bg-[#0b1715]/88 text-white shadow-2xl shadow-black/25"
      hover={false}
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/12">
          <Sparkles className="h-6 w-6 text-emerald-200" />
        </div>
        <h1 className="mb-2 font-heading text-3xl font-bold">
          <span className="grad-text">Create your workspace</span>
        </h1>
        <p className="text-sm text-white/60">
          Start with your employee account and let Supabase handle the rest.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ayesha Khan"
            required
            className="bg-white/6"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email">Work email</Label>
          <Input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="bg-white/6"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Use at least 8 characters"
            minLength={8}
            required
            className="bg-white/6"
          />
        </div>

        {error ? <p className="text-center text-sm text-rose-300">{error}</p> : null}
        {message ? <p className="text-center text-sm text-emerald-300">{message}</p> : null}

        <Button
          type="submit"
          className="w-full bg-emerald-500 text-white hover:bg-emerald-400"
          disabled={loading}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-emerald-200 hover:underline">
          Sign in
        </Link>
      </p>
    </GlassCard>
  );
}
