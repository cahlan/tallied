"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { exportToCsv, downloadCsv, type CsvTemplate } from "@/lib/csv";
import { getTransactions, type TransactionFilters } from "@/actions/transactions";
import { toast } from "sonner";

interface CsvExportButtonProps {
  filters: TransactionFilters;
  isPro: boolean;
}

export function CsvExportButton({ filters, isPro }: CsvExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport(template: CsvTemplate) {
    setExporting(true);
    // Fetch all transactions (no pagination) for export
    const result = await getTransactions({ ...filters, page: 1, pageSize: 10000 });
    if (result.error) {
      toast.error(result.error);
      setExporting(false);
      return;
    }
    const csv = exportToCsv(result.data, template);
    const date = new Date().toISOString().split("T")[0];
    downloadCsv(csv, `tallied-export-${date}.csv`);
    setExporting(false);
  }

  if (!isPro) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("default")}
        disabled={exporting}
      >
        <Download className="mr-2 h-4 w-4" />
        {exporting ? "Exporting..." : "Export CSV"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" disabled={exporting} />}
      >
        <Download className="mr-2 h-4 w-4" />
        {exporting ? "Exporting..." : "Export CSV"}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport("default")}>
          Standard CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("quickbooks")}>
          QuickBooks format
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("xero")}>
          Xero format
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
