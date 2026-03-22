export function getPlans() {
  return {
    free: {
      name: "Free",
      price: 0,
      priceId: null as string | null,
      scanLimit: 25,
      features: ["25 scans/month", "CSV export", "AI receipt extraction"],
    },
    pro: {
      name: "Pro",
      price: 15,
      priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
      scanLimit: Infinity,
      features: [
        "Unlimited scans",
        "Custom category rules",
        "QuickBooks CSV export",
        "Xero CSV export",
        "Priority support",
      ],
    },
    self_hosted: {
      name: "Self-Hosted",
      price: 8,
      priceId: process.env.STRIPE_SELF_HOSTED_PRICE_ID ?? "",
      scanLimit: Infinity,
      features: [
        "License key",
        "Docker deployment",
        "Bring your own API key",
        "Data stays on your server",
      ],
    },
  } as const;
}

// Static plan info (no env vars needed) for client components
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null as string | null,
    scanLimit: 25,
    features: ["25 scans/month", "CSV export", "AI receipt extraction"],
  },
  pro: {
    name: "Pro",
    price: 15,
    priceId: "",
    scanLimit: Infinity,
    features: [
      "Unlimited scans",
      "Custom category rules",
      "QuickBooks CSV export",
      "Xero CSV export",
      "Priority support",
    ],
  },
  self_hosted: {
    name: "Self-Hosted",
    price: 8,
    priceId: "",
    scanLimit: Infinity,
    features: [
      "License key",
      "Docker deployment",
      "Bring your own API key",
      "Data stays on your server",
    ],
  },
} as const;
