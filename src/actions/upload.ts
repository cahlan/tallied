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

  const adminClient = createAdminClient();

  const { data: currentCount } = await adminClient.rpc("get_scan_count", {
    p_user_id: user.id,
  });

  if (limit !== Infinity && (currentCount ?? 0) >= limit) {
    return {
      error: `You've reached your monthly scan limit (${limit}). Upgrade to Pro for unlimited scans.`,
    };
  }

  // Read file into buffer for both storage and AI
  const arrayBuf = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  const base64 = buffer.toString("base64");

  // Upload to Supabase Storage
  const fileExt = file.name.split(".").pop() ?? "jpg";
  const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

  let imageUrl: string | null = null;
  try {
    const { error: uploadError } = await adminClient.storage
      .from("receipts")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", JSON.stringify(uploadError));
      // Continue without storage — we still have the base64 for extraction
    } else {
      imageUrl = fileName;
    }
  } catch (storageErr) {
    console.error("Storage exception:", storageErr);
    // Continue without storage
  }

  // Create pending transaction (use admin client — user already verified above)
  const { data: transaction, error: insertError } = await adminClient
    .from("transactions")
    .insert({
      user_id: user.id,
      image_url: imageUrl,
      extraction_status: "pending",
    })
    .select()
    .single();

  if (insertError || !transaction) {
    console.error("Insert error:", JSON.stringify(insertError));
    return { error: "Failed to create transaction record" };
  }

  try {
    // Extract receipt data using Claude Vision
    const extracted = await extractReceipt(base64, file.type);

    // Apply category rules
    let finalCategory = extracted.category;
    if (extracted.vendor_name) {
      const { data: rules } = await adminClient
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
    const { data: updated, error: updateError } = await adminClient
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
    await adminClient
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
