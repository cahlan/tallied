import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedReceipt } from "./types";
import { CATEGORIES } from "@/lib/constants";

function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
}

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export async function extractReceipt(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedReceipt> {
  const categoryList = CATEGORIES.join(", ");

  const response = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as ImageMediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `You are a receipt data extraction assistant. Extract structured data from this receipt or invoice image.

Return ONLY valid JSON with this exact schema (no markdown fences, no explanation):
{
  "vendor_name": "string or null if unreadable",
  "transaction_date": "YYYY-MM-DD or null if unreadable",
  "amount": total_amount_as_number_or_null,
  "currency": "USD",
  "category": "one of: ${categoryList}",
  "has_tax": true_or_false,
  "tax_amount": tax_amount_as_number_or_null,
  "line_items": [{"description": "item name", "amount": price_as_number}],
  "confidence": 0.0_to_1.0
}

Rules:
- amount should be the total/grand total, not subtotal
- If tax is listed separately, set has_tax to true and extract tax_amount
- If you cannot read the receipt clearly, set confidence below 0.5
- For category, choose the single best match from the list provided
- Dates should be in YYYY-MM-DD format
- All monetary values should be numbers (no currency symbols)`,
          },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return JSON.parse(cleaned) as ExtractedReceipt;
}
