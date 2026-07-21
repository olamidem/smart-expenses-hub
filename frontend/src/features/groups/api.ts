import { apiFetch } from "../../shared/lib/apiClient";

export interface GroupMember {
  id: string;
  userId: string | null;
  displayName: string | null;
  role: "ADMIN" | "MEMBER";
  user: { id: string; name: string; email: string } | null;
}

export interface Group {
  id: string;
  name: string;
  currency: string;
  members: GroupMember[];
}

export function getGroups() {
  return apiFetch<Group[]>("/groups");
}

export function getGroup(groupId: string) {
  return apiFetch<Group>(`/groups/${groupId}`);
}
