"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants";
import { updateTransaction, deleteTransaction } from "@/actions/transactions";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

interface TransactionDetailProps {
  transaction: Transaction;
  imageUrl: string | null;
}

export function TransactionDetail({
  transaction,
  imageUrl,
}: TransactionDetailProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [vendor, setVendor] = useState(transaction.vendor_name ?? "");
  const [date, setDate] = useState(transaction.transaction_date ?? "");
  const [amount, setAmount] = useState(transaction.amount?.toString() ?? "");
  const [category, setCategory] = useState(transaction.category ?? "Other");
  const [hasTax, setHasTax] = useState(transaction.has_tax);
  const [taxAmount, setTaxAmount] = useState(
    transaction.tax_amount?.toString() ?? ""
  );
  const [notes, setNotes] = useState(transaction.notes ?? "");

  async function handleSave() {
    setSaving(true);
    const result = await updateTransaction(transaction.id, {
      vendor_name: vendor || null,
      transaction_date: date || null,
      amount: amount ? parseFloat(amount) : null,
      category: category || null,
      has_tax: hasTax,
      tax_amount: taxAmount ? parseFloat(taxAmount) : null,
      notes: notes || null,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Transaction updated");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this receipt? This cannot be undone.")) return;
    setDeleting(true);
    const result = await deleteTransaction(transaction.id);
    if (result.error) {
      toast.error(result.error);
      setDeleting(false);
    } else {
      toast.success("Receipt deleted");
      router.push("/transactions");
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Receipt image */}
        {imageUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Receipt</CardTitle>
            </CardHeader>
            <CardContent>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Receipt"
                className="w-full rounded-md"
              />
            </CardContent>
          </Card>
        )}

        {/* Edit form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
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
            {hasTax && (
              <div className="space-y-2">
                <Label htmlFor="taxAmount">Tax amount</Label>
                <Input
                  id="taxAmount"
                  type="number"
                  step="0.01"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
