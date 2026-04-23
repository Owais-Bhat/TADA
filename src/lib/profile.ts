import type { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export function buildProfileInsert(user: Pick<User, "email" | "id" | "user_metadata">): ProfileInsert {
  const metadataName =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name.trim()
      : "";
  const email = user.email ?? "";

  return {
    email,
    id: user.id,
    is_active: true,
    name: metadataName || email || "ExpenseFlow User",
    role: "Regular",
  };
}

export function isProfileActive(profile: Pick<ProfileRow, "is_active"> | null) {
  return profile?.is_active !== false;
}
