"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PlanCard } from "@/components/billing/plan-card";
import { UsageMeter } from "@/components/billing/usage-meter";
import { PLANS } from "@/lib/stripe/config";
import { PLAN_LIMITS } from "@/lib/constants";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated! Welcome to Pro.");
    }
    if (searchParams.get("canceled") === "true") {
      toast.info("Checkout canceled.");
    }
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(p);

      const { data: count } = await supabase.rpc("get_scan_count", {
        p_user_id: user.id,
      });
      setScanCount(count ?? 0);
    }
    load();
  }, []);

  async function handleUpgrade(priceId: string, planKey: string) {
    setLoading(planKey);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Failed to start checkout");
      }
    } catch {
      toast.error("Failed to start checkout");
    }
    setLoading(null);
  }

  async function handleManage() {
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Failed to open billing portal");
      }
    } catch {
      toast.error("Failed to open billing portal");
    }
  }

  const currentPlan = profile?.subscription_status ?? "free";
  const planLimit =
    PLAN_LIMITS[currentPlan === "canceled" ? "free" : currentPlan]
      ?.scansPerMonth ?? 25;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>

      <UsageMeter used={scanCount} limit={planLimit} plan={currentPlan} />

      {profile?.subscription_id && (
        <div className="flex justify-end">
          <button
            onClick={handleManage}
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            Manage subscription
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <PlanCard
          name={PLANS.free.name}
          price={PLANS.free.price}
          features={PLANS.free.features}
          isCurrent={currentPlan === "free" || currentPlan === "canceled"}
        />
        <PlanCard
          name={PLANS.pro.name}
          price={PLANS.pro.price}
          features={PLANS.pro.features}
          isCurrent={currentPlan === "pro"}
          onSelect={() => handleUpgrade(PLANS.pro.priceId!, "pro")}
          loading={loading === "pro"}
          disabled={!PLANS.pro.priceId}
        />
        <PlanCard
          name={PLANS.self_hosted.name}
          price={PLANS.self_hosted.price}
          features={PLANS.self_hosted.features}
          isCurrent={currentPlan === "self_hosted"}
          onSelect={() =>
            handleUpgrade(PLANS.self_hosted.priceId!, "self_hosted")
          }
          loading={loading === "self_hosted"}
          disabled={!PLANS.self_hosted.priceId}
        />
      </div>
    </div>
  );
}
