import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TransactionDetail } from "@/components/transactions/transaction-detail";

interface TransactionPageProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionPage({
  params,
}: TransactionPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: transaction } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!transaction) {
    notFound();
  }

  // Generate signed URL for receipt image
  let imageUrl: string | null = null;
  if (transaction.image_url) {
    const { data } = await supabase.storage
      .from("receipts")
      .createSignedUrl(transaction.image_url, 3600);
    imageUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <TransactionDetail transaction={transaction} imageUrl={imageUrl} />
    </div>
  );
}
