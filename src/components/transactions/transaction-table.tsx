"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

interface TransactionTableProps {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export function TransactionTable({
  transactions,
  totalCount,
  page,
  pageSize,
}: TransactionTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalCount / pageSize);

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/transactions?${params.toString()}`);
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No transactions found.{" "}
        <Link href="/upload" className="text-primary hover:underline">
          Upload a receipt
        </Link>{" "}
        to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Tax</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow
                key={t.id}
                className="cursor-pointer"
                onClick={() => router.push(`/transactions/${t.id}`)}
              >
                <TableCell className="text-sm">
                  {t.transaction_date
                    ? new Date(t.transaction_date + "T00:00:00").toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell className="font-medium">
                  {t.vendor_name ?? "Unknown"}
                </TableCell>
                <TableCell>
                  {t.category ? (
                    <Badge variant="secondary">{t.category}</Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {t.amount != null
                    ? `$${Number(t.amount).toFixed(2)}`
                    : "—"}
                </TableCell>
                <TableCell className="text-center text-sm">
                  {t.has_tax ? "Yes" : "No"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalCount} total receipt{totalCount !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
