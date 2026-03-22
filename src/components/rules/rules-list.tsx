"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRules, deleteRule } from "@/actions/rules";
import { RuleForm } from "./rule-form";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Rule = Database["public"]["Tables"]["category_rules"]["Row"];

export function RulesList() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRules = useCallback(async () => {
    const result = await getRules();
    if (result.error) {
      toast.error(result.error);
    } else {
      setRules(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  async function handleDelete(id: string) {
    const result = await deleteRule(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Rule deleted");
      loadRules();
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading rules...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Category rules</h2>
          <p className="text-sm text-muted-foreground">
            Automatically categorize receipts based on vendor name.
          </p>
        </div>
        <RuleForm onCreated={loadRules} />
      </div>

      {rules.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No rules yet. Create a rule to automatically categorize receipts from
          specific vendors.
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor pattern</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Match type</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">
                    {rule.vendor_pattern}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{rule.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rule.is_exact_match ? "Exact" : "Contains"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
