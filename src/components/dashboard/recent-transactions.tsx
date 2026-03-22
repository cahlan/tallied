import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No receipts yet.{" "}
            <Link href="/upload" className="text-primary hover:underline">
              Upload your first receipt
            </Link>{" "}
            to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent receipts</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/transactions">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((t) => (
            <Link
              key={t.id}
              href={`/transactions/${t.id}`}
              className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {t.vendor_name ?? "Unknown vendor"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {t.transaction_date
                      ? new Date(t.transaction_date + "T00:00:00").toLocaleDateString()
                      : "No date"}
                  </span>
                  {t.category && (
                    <Badge variant="secondary" className="text-xs">
                      {t.category}
                    </Badge>
                  )}
                </div>
              </div>
              <span className="ml-4 text-sm font-medium">
                {t.amount != null
                  ? `$${Number(t.amount).toFixed(2)}`
                  : "—"}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
