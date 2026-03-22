"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CATEGORIES } from "@/lib/constants";
import { createRule } from "@/actions/rules";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function RuleForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [vendorPattern, setVendorPattern] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [isExactMatch, setIsExactMatch] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vendorPattern.trim()) {
      toast.error("Vendor pattern is required");
      return;
    }
    setSaving(true);
    const result = await createRule({
      vendorPattern: vendorPattern.trim(),
      category,
      isExactMatch,
    });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Rule created");
      setVendorPattern("");
      setIsExactMatch(false);
      setOpen(false);
      onCreated();
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="mr-2 h-4 w-4" />
        Add rule
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create category rule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pattern">Vendor pattern</Label>
            <Input
              id="pattern"
              value={vendorPattern}
              onChange={(e) => setVendorPattern(e.target.value)}
              placeholder='e.g. "Starbucks" or "uber"'
            />
            <p className="text-xs text-muted-foreground">
              When a receipt vendor matches this pattern, the category below will
              be applied automatically.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="exactMatch"
              type="checkbox"
              checked={isExactMatch}
              onChange={(e) => setIsExactMatch(e.target.checked)}
              className="rounded border-input"
            />
            <Label htmlFor="exactMatch">Exact match only</Label>
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Creating..." : "Create rule"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
