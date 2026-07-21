import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { getGroup, type Group } from "../api";
import { getExpenses, type Expense } from "../../expenses/api";
import { AddExpenseForm } from "../../expenses/components/AddExpenseForm";
import { Button } from "@/shared/components/Button";
import { formatMoney } from "@/lib/formatMoney";

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    if (!groupId) return;
    const [groupData, expensesData] = await Promise.all([
      getGroup(groupId),
      getExpenses(groupId),
    ]);
    setGroup(groupData);
    setExpenses(expensesData);
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !group) return <p className="text-text-muted">Loading...</p>;

  const totalCents = expenses.reduce((sum, e) => sum + e.amountCents, 0);
  // Assumes the logged-in user is the first member for now — refined once
  // we track "which member am I" more precisely via /auth/me.
  const currentMemberId = group.members[0]?.id ?? "";

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{group.name}</h1>
          <p className="text-sm text-text-muted mt-1">
            {formatMoney(totalCents, group.currency)} total spent ·{" "}
            {group.members.length} members
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4"
        >
          <Plus size={16} />
          Add expense
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <AddExpenseForm
            groupId={group.id}
            members={group.members}
            currentMemberId={currentMemberId}
            onCreated={loadData}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {expenses.length === 0 ? (
          <p className="text-text-muted">No expenses yet.</p>
        ) : (
          expenses.map((expense, i) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3"
            >
              <div>
                <p className="text-text">{expense.description}</p>
                <p className="text-xs text-text-muted">
                  {new Date(expense.spentAt).toLocaleDateString()} ·{" "}
                  {expense.splitType}
                </p>
              </div>
              <p className="font-medium">
                {formatMoney(expense.amountCents, group.currency)}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
