import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get profile for subscription info
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user!.id)
    .single();

  // Get current month scan count
  const { data: scanCount } = await supabase.rpc("get_scan_count", {
    p_user_id: user!.id,
  });

  // Get total transaction count
  const { count: totalCount } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  // Get this month's total amount
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthTransactions } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", user!.id)
    .gte("transaction_date", startOfMonth.toISOString().split("T")[0]);

  const monthTotal = (monthTransactions ?? []).reduce(
    (sum, t) => sum + (t.amount ?? 0),
    0
  );

  // Get recent transactions
  const { data: recent } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <StatsCards
        scansThisMonth={scanCount ?? 0}
        plan={profile?.subscription_status ?? "free"}
        totalTransactions={totalCount ?? 0}
        monthTotal={monthTotal}
      />
      <RecentTransactions transactions={recent ?? []} />
    </div>
  );
}
