import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getTransactions } from "@/actions/transactions";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { FiltersBar } from "@/components/transactions/filters-bar";
import { CsvExportButton } from "@/components/transactions/csv-export-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload } from "lucide-react";

interface TransactionsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user!.id)
    .single();

  const isPro = profile?.subscription_status === "pro";
  const page = parseInt(params.page ?? "1", 10);
  const pageSize = 20;

  const filters = {
    search: params.search,
    category: params.category,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    page,
    pageSize,
  };

  const { data: transactions, count } = await getTransactions(filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <div className="flex items-center gap-2">
          <CsvExportButton filters={filters} isPro={isPro} />
          <Button size="sm" asChild>
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Link>
          </Button>
        </div>
      </div>
      <Suspense>
        <FiltersBar />
      </Suspense>
      <TransactionTable
        transactions={transactions}
        totalCount={count}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
