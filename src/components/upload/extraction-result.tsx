"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants";
import { updateTransaction } from "@/actions/transactions";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export function ExtractionResult({
  transaction,
}: {
  transaction: Transaction;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [vendor, setVendor] = useState(transaction.vendor_name ?? "");
  const [date, setDate] = useState(transaction.transaction_date ?? "");
  const [amount, setAmount] = useState(
    transaction.amount?.toString() ?? ""
  );
  const [category, setCategory] = useState(transaction.category ?? "Other");
  const [hasTax, setHasTax] = useState(transaction.has_tax);
  const [taxAmount, setTaxAmount] = useState(
    transaction.tax_amount?.toString() ?? ""
  );

  const rawExtraction = transaction.raw_extraction as Record<string, unknown> | null;
  const confidence = (rawExtraction?.confidence as number) ?? 1;
  const isLowConfidence = confidence < 0.5;

  async function handleSave() {
    setSaving(true);
    const result = await updateTransaction(transaction.id, {
      vendor_name: vendor || null,
      transaction_date: date || null,
      amount: amount ? parseFloat(amount) : null,
      category: category || null,
      has_tax: hasTax,
      tax_amount: taxAmount ? parseFloat(taxAmount) : null,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Receipt saved!");
      router.push("/transactions");
    }
    setSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Extracted data</CardTitle>
          <div className="flex gap-2">
            {isLowConfidence && (
              <Badge variant="destructive">Low confidence</Badge>
            )}
            {transaction.extraction_status === "failed" && (
              <Badge variant="destructive">Extraction failed</Badge>
            )}
            {transaction.extraction_status === "success" && !isLowConfidence && (
              <Badge variant="secondary">
                {Math.round(confidence * 100)}% confidence
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLowConfidence && (
          <p className="text-sm text-muted-foreground">
            The receipt was difficult to read. Please review and correct the
            extracted data.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Input
              id="vendor"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. Starbucks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                id="hasTax"
                type="checkbox"
                checked={hasTax}
                onChange={(e) => setHasTax(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="hasTax">Includes tax</Label>
            </div>
          </div>
          {hasTax && (
            <div className="space-y-2">
              <Label htmlFor="taxAmount">Tax amount</Label>
              <Input
                id="taxAmount"
                type="number"
                step="0.01"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save receipt"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/upload")}
            disabled={saving}
          >
            Scan another
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
