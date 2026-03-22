"use server";

import { createClient } from "@/lib/supabase/server";

export async function getRules() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated", data: [] };

  const { data, error } = await supabase
    .from("category_rules")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] };
  return { data: data ?? [] };
}

export async function createRule(input: {
  vendorPattern: string;
  category: string;
  isExactMatch: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("category_rules")
    .insert({
      user_id: user.id,
      vendor_pattern: input.vendorPattern,
      category: input.category,
      is_exact_match: input.isExactMatch,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A rule for this vendor pattern already exists" };
    }
    return { error: error.message };
  }

  return { data };
}

export async function deleteRule(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("category_rules")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
