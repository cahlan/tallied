import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_LIMITS, type SubscriptionStatus } from "@/lib/constants";
import { Receipt, ScanLine, DollarSign } from "lucide-react";

interface StatsCardsProps {
  scansThisMonth: number;
  plan: SubscriptionStatus;
  totalTransactions: number;
  monthTotal: number;
}

export function StatsCards({
  scansThisMonth,
  plan,
  totalTransactions,
  monthTotal,
}: StatsCardsProps) {
  const limit = PLAN_LIMITS[plan === "canceled" ? "free" : plan]?.scansPerMonth;
  const limitDisplay =
    limit === Infinity ? "unlimited" : `/ ${limit}`;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Scans this month
          </CardTitle>
          <ScanLine className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {scansThisMonth}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              {limitDisplay}
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total receipts
          </CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTransactions}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Spend this month
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${monthTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
