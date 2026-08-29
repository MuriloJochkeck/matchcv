import type { User } from "@supabase/supabase-js";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
  mode: string;
};

function toCurrentUser(user: User): CurrentUser {
  const metadataName = user.user_metadata?.display_name;
  const displayName =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : user.email?.split("@")[0] || "Candidato";

  return {
    id: user.id,
    email: user.email || "",
    displayName,
    mode: "supabase",
  };
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return toCurrentUser(data.user);
});

export async function ensureProfile(user: User) {
  const supabase = await createClient();
  const current = toCurrentUser(user);
  const { error } = await supabase.from("profiles").upsert(
    {
      id: current.id,
      display_name: current.displayName,
      locale: "pt-BR",
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (error) throw error;
}
