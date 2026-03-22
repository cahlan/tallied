import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ScanLine, Shield, DollarSign } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-lg font-semibold tracking-tight">Tallied</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Stop typing in receipts.
          <br />
          <span className="text-muted-foreground">Let Tallied do it.</span>
        </h1>
        <p className="mt-4 max-w-lg text-lg text-muted-foreground">
          Upload a receipt, get structured data in seconds. Flat-rate pricing,
          no per-scan fees. Self-hosted option for firms that need it.
        </p>
        <div className="mt-8 flex gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">Start free — 25 scans/month</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-semibold">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <ScanLine className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Upload</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Drop a photo or PDF of any receipt or invoice.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Extract</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Vendor, date, amount, category, and tax — extracted
                automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Export</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Download CSV for QuickBooks, Xero, or your own spreadsheet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-semibold">
            Simple, flat-rate pricing
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Free */}
            <div className="rounded-lg border p-6">
              <h3 className="font-semibold">Free</h3>
              <p className="mt-1 text-3xl font-bold">$0</p>
              <p className="text-sm text-muted-foreground">forever</p>
              <ul className="mt-4 space-y-2">
                {["25 scans/month", "CSV export", "AI extraction"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant="outline" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
            {/* Pro */}
            <div className="rounded-lg border-2 border-primary p-6">
              <h3 className="font-semibold">Pro</h3>
              <p className="mt-1 text-3xl font-bold">$15</p>
              <p className="text-sm text-muted-foreground">/month</p>
              <ul className="mt-4 space-y-2">
                {[
                  "Unlimited scans",
                  "Category rules",
                  "QuickBooks CSV",
                  "Xero CSV",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" asChild>
                <Link href="/signup">Start free trial</Link>
              </Button>
            </div>
            {/* Self-Hosted */}
            <div className="rounded-lg border p-6">
              <h3 className="font-semibold">Self-Hosted</h3>
              <p className="mt-1 text-3xl font-bold">$8</p>
              <p className="text-sm text-muted-foreground">/month</p>
              <ul className="mt-4 space-y-2">
                {[
                  "Docker deployment",
                  "Your own API key",
                  "Data on your server",
                  "License key",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant="outline" asChild>
                <Link href="/signup">Coming soon</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Tallied — Simple receipt scanning for small businesses.
      </footer>
    </div>
  );
}
