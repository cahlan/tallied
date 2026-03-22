"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractReceipt } from "@/lib/ai/extract";
import { MAX_FILE_SIZE } from "@/lib/constants";
import { PLAN_LIMITS } from "@/lib/constants";

export async function uploadReceipt(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { error: "No file provided" };
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!validTypes.includes(file.type)) {
    return { error: "Invalid file type. Please upload a JPEG, PNG, or PDF." };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File too large. Maximum size is 10MB." };
  }

  // Check scan limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const plan = profile?.subscription_status ?? "free";
  const limit =
    PLAN_LIMITS[plan === "canceled" ? "free" : plan]?.scansPerMonth ?? 25;

  const { data: currentCount } = await supabase.rpc("get_scan_count", {
    p_user_id: user.id,
  });

  if (limit !== Infinity && (currentCount ?? 0) >= limit) {
    return {
      error: `You've reached your monthly scan limit (${limit}). Upgrade to Pro for unlimited scans.`,
    };
  }

  // Use admin client for storage (bypasses RLS, avoids cookie auth issues)
  const adminClient = createAdminClient();

  // Upload to Supabase Storage
  const fileExt = file.name.split(".").pop() ?? "jpg";
  const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

  const arrayBuf = await file.arrayBuffer();
  const { error: uploadError } = await adminClient.storage
    .from("receipts")
    .upload(fileName, arrayBuf, {
      contentType: file.type,
    });

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  // Create pending transaction
  const { data: transaction, error: insertError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      image_url: fileName,
      extraction_status: "pending",
    })
    .select()
    .single();

  if (insertError || !transaction) {
    return { error: "Failed to create transaction record" };
  }

  // Download file for AI extraction
  const { data: fileData } = await adminClient.storage
    .from("receipts")
    .download(fileName);

  if (!fileData) {
    await supabase
      .from("transactions")
      .update({ extraction_status: "failed" })
      .eq("id", transaction.id);
    return { error: "Failed to read uploaded file" };
  }

  // Convert to base64 for Claude Vision
  const arrayBuffer = await fileData.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  try {
    // Extract receipt data using Claude Vision
    const extracted = await extractReceipt(base64, file.type);

    // Apply category rules
    let finalCategory = extracted.category;
    if (extracted.vendor_name) {
      const { data: rules } = await supabase
        .from("category_rules")
        .select("*")
        .eq("user_id", user.id);

      for (const rule of rules ?? []) {
        const vendor = extracted.vendor_name!.toLowerCase();
        const pattern = rule.vendor_pattern.toLowerCase();
        if (rule.is_exact_match ? vendor === pattern : vendor.includes(pattern)) {
          finalCategory = rule.category;
          break;
        }
      }
    }

    // Update transaction with extracted data
    const { data: updated, error: updateError } = await supabase
      .from("transactions")
      .update({
        vendor_name: extracted.vendor_name,
        transaction_date: extracted.transaction_date,
        amount: extracted.amount,
        currency: extracted.currency,
        category: finalCategory,
        ai_category: extracted.category,
        has_tax: extracted.has_tax,
        tax_amount: extracted.tax_amount,
        raw_extraction: JSON.parse(JSON.stringify(extracted)),
        extraction_status: "success",
      })
      .eq("id", transaction.id)
      .select()
      .single();

    if (updateError) {
      return { error: "Failed to save extraction results" };
    }

    // Increment scan count
    await adminClient.rpc("increment_scan_count", { p_user_id: user.id });

    return { data: updated };
  } catch (err) {
    // Mark as failed on extraction error
    await supabase
      .from("transactions")
      .update({
        extraction_status: "failed",
        raw_extraction: {
          error: err instanceof Error ? err.message : "Unknown error",
        },
      })
      .eq("id", transaction.id);

    return {
      error:
        "Failed to extract receipt data. You can manually enter the details.",
      transactionId: transaction.id,
    };
  }
}
