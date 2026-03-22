import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UsageMeterProps {
  used: number;
  limit: number;
  plan: string;
}

export function UsageMeter({ used, limit, plan }: UsageMeterProps) {
  const isUnlimited = limit === Infinity || !isFinite(limit);
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Scan usage this month</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold">{used}</span>
          <span className="text-sm text-muted-foreground">
            {isUnlimited ? "unlimited" : `of ${limit} scans`}
          </span>
        </div>
        {!isUnlimited && (
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                isNearLimit ? "bg-destructive" : "bg-primary"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground capitalize">
          {plan} plan
        </p>
      </CardContent>
    </Card>
  );
}
