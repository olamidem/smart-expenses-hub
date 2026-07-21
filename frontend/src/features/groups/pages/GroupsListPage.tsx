import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getGroups, type Group } from "../api";

export function GroupsListPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGroups()
      .then(setGroups)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load groups"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-text-muted">Loading groups...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Groups</h1>

      {groups.length === 0 ? (
        <p className="text-text-muted">
          No groups yet — create one to start splitting expenses.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/groups/${group.id}`}
                className="block bg-surface border border-border rounded-xl p-5 hover:border-brand transition-colors"
              >
                <h2 className="font-medium text-text">{group.name}</h2>
                <p className="text-sm text-text-muted mt-1">
                  {group.members.length} member
                  {group.members.length !== 1 ? "s" : ""}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
