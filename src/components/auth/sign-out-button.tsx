"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      className="w-full justify-center border border-emerald-300/18 bg-emerald-500 text-white hover:bg-emerald-400"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          router.push("/auth/login");
          router.refresh();
        });
      }}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
