"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants";
import { X } from "lucide-react";

export function FiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1 on filter change
    router.push(`/transactions?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/transactions");
  }

  const hasFilters =
    searchParams.get("search") ||
    searchParams.get("category") ||
    searchParams.get("dateFrom") ||
    searchParams.get("dateTo");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search vendors..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => updateParam("search", e.target.value)}
        className="w-48"
      />
      <Select
        value={searchParams.get("category") ?? "all"}
        onValueChange={(v) => updateParam("category", !v || v === "all" ? "" : v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        defaultValue={searchParams.get("dateFrom") ?? ""}
        onChange={(e) => updateParam("dateFrom", e.target.value)}
        className="w-36"
        placeholder="From"
      />
      <Input
        type="date"
        defaultValue={searchParams.get("dateTo") ?? ""}
        onChange={(e) => updateParam("dateTo", e.target.value)}
        className="w-36"
        placeholder="To"
      />
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
