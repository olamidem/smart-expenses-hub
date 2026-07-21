import { apiFetch } from "../../shared/lib/apiClient";

export interface ExpenseShare {
  id: string;
  groupMemberId: string;
  amountCents: number;
}

export interface Expense {
  id: string;
  description: string;
  amountCents: number;
  splitType: "EQUAL" | "EXACT";
  paidById: string;
  spentAt: string;
  shares: ExpenseShare[];
}

export function getExpenses(groupId: string) {
  return apiFetch<Expense[]>(`/groups/${groupId}/expenses`);
}

interface CreateExpensePayload {
  description: string;
  amountCents: number;
  paidByMemberId: string;
  splitType: "EQUAL" | "EXACT";
  participantMemberIds?: string[];
  shares?: { groupMemberId: string; amountCents: number }[];
}

export function createExpense(groupId: string, payload: CreateExpensePayload) {
  return apiFetch<Expense>(`/groups/${groupId}/expenses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
