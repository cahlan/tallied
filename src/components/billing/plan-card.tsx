"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PlanCardProps {
  name: string;
  price: number;
  features: readonly string[];
  isCurrent: boolean;
  onSelect?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function PlanCard({
  name,
  price,
  features,
  isCurrent,
  onSelect,
  loading,
  disabled,
}: PlanCardProps) {
  return (
    <Card className={isCurrent ? "border-primary" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{name}</CardTitle>
          {isCurrent && <Badge>Current plan</Badge>}
        </div>
        <CardDescription>
          {price === 0 ? (
            <span className="text-2xl font-bold text-foreground">Free</span>
          ) : (
            <>
              <span className="text-2xl font-bold text-foreground">
                ${price}
              </span>
              <span className="text-muted-foreground">/month</span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isCurrent ? (
          <Button className="w-full" variant="outline" disabled>
            Current plan
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={onSelect}
            disabled={loading || disabled}
          >
            {loading ? "Processing..." : price === 0 ? "Downgrade" : "Upgrade"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
