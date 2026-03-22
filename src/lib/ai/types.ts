export interface ExtractedReceipt {
  vendor_name: string | null;
  transaction_date: string | null; // YYYY-MM-DD
  amount: number | null;
  currency: string;
  category: string | null;
  has_tax: boolean;
  tax_amount: number | null;
  line_items: Array<{ description: string; amount: number }>;
  confidence: number; // 0-1
}
