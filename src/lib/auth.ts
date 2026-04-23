import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { buildProfileInsert, isProfileActive } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { getRoleHome, isAdminRole } from "@/lib/roles";

export type AppProfile = Database["public"]["Tables"]["profiles"]["Row"];
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type Viewer = {
  supabase: SupabaseServerClient;
  user: User | null;
  profile: AppProfile | null;
};
type AuthenticatedViewer = {
  supabase: SupabaseServerClient;
  user: User;
  profile: AppProfile;
};

export async function getViewer(): Promise<Viewer> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null as AppProfile | null };
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  let profile = (profileData as AppProfile | null) ?? null;

  if (!profile) {
    const { data: insertedProfile } = await supabase
      .from("profiles")
      .insert(buildProfileInsert(user) as never)
      .select("*")
      .single();

    profile = (insertedProfile as AppProfile | null) ?? null;
  }

  return { supabase, user, profile };
}

export async function requireViewer(options?: {
  admin?: boolean;
  roles?: readonly string[];
}): Promise<AuthenticatedViewer> {
  const viewer = await getViewer();

  if (!viewer.user || !viewer.profile || !isProfileActive(viewer.profile)) {
    redirect("/auth/login");
  }

  if (options?.admin && !isAdminRole(viewer.profile.role)) {
    redirect("/dashboard");
  }

  if (options?.roles && !options.roles.includes(viewer.profile.role)) {
    redirect(getRoleHome(viewer.profile.role));
  }

  return {
    supabase: viewer.supabase,
    user: viewer.user,
    profile: viewer.profile,
  };
}
