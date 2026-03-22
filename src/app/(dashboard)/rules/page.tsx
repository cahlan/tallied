import { RulesList } from "@/components/rules/rules-list";

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Rules</h1>
      <RulesList />
    </div>
  );
}
