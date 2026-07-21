import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Label } from "@/shared/components/Label";
import { createExpense } from "../api";
import type { GroupMember } from "../../groups/api";

interface Props {
  groupId: string;
  members: GroupMember[];
  currentMemberId: string;
  onCreated: () => void;
  onClose: () => void;
}

export function AddExpenseForm({
  groupId,
  members,
  currentMemberId,
  onCreated,
  onClose,
}: Props) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidByMemberId, setPaidByMemberId] = useState(currentMemberId);
  const [splitType, setSplitType] = useState<"EQUAL" | "EXACT">("EQUAL");
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

 function memberLabel(m: GroupMember) {
   return m.user?.name ?? m.displayName ?? "Unknown member";
 }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!amountCents || amountCents <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      if (splitType === "EQUAL") {
        await createExpense(groupId, {
          description,
          amountCents,
          paidByMemberId,
          splitType: "EQUAL",
        });
      } else {
        const shares = members.map((m) => ({
          groupMemberId: m.id,
          amountCents: Math.round(parseFloat(exactAmounts[m.id] ?? "0") * 100),
        }));
        await createExpense(groupId, {
          description,
          amountCents,
          paidByMemberId,
          splitType: "EXACT",
          shares,
        });
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface border border-border rounded-xl p-6 mb-6"
    >
      <h2 className="text-lg font-medium mb-4">Add expense</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="paidBy">Paid by</Label>
            <select
              id="paidBy"
              value={paidByMemberId}
              onChange={(e) => setPaidByMemberId(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-text"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {memberLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label>Split</Label>
          <div className="flex gap-2">
            {(["EQUAL", "EXACT"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSplitType(type)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  splitType === type
                    ? "bg-brand border-brand text-white"
                    : "border-border text-text-muted hover:text-text"
                }`}
              >
                {type === "EQUAL" ? "Equal" : "Exact amounts"}
              </button>
            ))}
          </div>
        </div>

        {splitType === "EXACT" && (
          <div className="space-y-2">
            <Label>Amount per member</Label>
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="text-sm text-text-muted w-32">
                  {memberLabel(m)}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={exactAmounts[m.id] ?? ""}
                  onChange={(e) =>
                    setExactAmounts((prev) => ({
                      ...prev,
                      [m.id]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? "Saving..." : "Save expense"}
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 text-sm text-text-muted hover:text-text"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}
