"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];

export interface TransactionFilters {
  search?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export async function getTransactions(filters: TransactionFilters = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated", data: [], count: 0 };

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    query = query.ilike("vendor_name", `%${filters.search}%`);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.dateFrom) {
    query = query.gte("transaction_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("transaction_date", filters.dateTo);
  }

  const { data, count, error } = await query;

  if (error) return { error: error.message, data: [], count: 0 };
  return { data: data ?? [], count: count ?? 0 };
}

export async function getTransaction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function updateTransaction(
  id: string,
  updates: TransactionUpdate
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Get image URL to delete from storage
  const { data: transaction } = await supabase
    .from("transactions")
    .select("image_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (transaction?.image_url) {
    await supabase.storage.from("receipts").remove([transaction.image_url]);
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
