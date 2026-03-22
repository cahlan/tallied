import Papa from "papaparse";
import type { Database } from "@/lib/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export type CsvTemplate = "default" | "quickbooks" | "xero";

interface CsvRow {
  [key: string]: string | number | boolean | null;
}

function formatDefault(transactions: Transaction[]): CsvRow[] {
  return transactions.map((t) => ({
    Date: t.transaction_date ?? "",
    Vendor: t.vendor_name ?? "",
    Amount: t.amount ?? "",
    Currency: t.currency,
    Category: t.category ?? "",
    Tax: t.has_tax ? "Yes" : "No",
    "Tax Amount": t.tax_amount ?? "",
    Notes: t.notes ?? "",
  }));
}

function formatQuickBooks(transactions: Transaction[]): CsvRow[] {
  return transactions.map((t) => ({
    Date: t.transaction_date ?? "",
    "Transaction Type": "Expense",
    Num: "",
    Name: t.vendor_name ?? "",
    Memo: t.notes ?? "",
    Account: t.category ?? "Uncategorized",
    Amount: t.amount ? -Math.abs(t.amount) : "",
    "Tax Amount": t.tax_amount ?? "",
  }));
}

function formatXero(transactions: Transaction[]): CsvRow[] {
  return transactions.map((t) => ({
    "*ContactName": t.vendor_name ?? "",
    "*InvoiceNumber": "",
    "*InvoiceDate": t.transaction_date ?? "",
    "*DueDate": t.transaction_date ?? "",
    "Total": t.amount ?? "",
    "*AccountCode": "",
    "*TaxType": t.has_tax ? "Tax on Purchases" : "No Tax",
    Description: t.category ?? "",
  }));
}

export function exportToCsv(
  transactions: Transaction[],
  template: CsvTemplate = "default"
): string {
  const formatters = {
    default: formatDefault,
    quickbooks: formatQuickBooks,
    xero: formatXero,
  };

  const rows = formatters[template](transactions);
  return Papa.unparse(rows);
}

export function downloadCsv(csvString: string, filename: string) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
