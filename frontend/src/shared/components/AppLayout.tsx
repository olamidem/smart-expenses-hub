import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Receipt,
  ArrowLeftRight,
  Wallet,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/settlements", label: "Settlements", icon: ArrowLeftRight },
  { to: "/budgets", label: "Budgets", icon: Wallet },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout() {
  return (
    <div className="min-h-screen flex bg-bg text-text">
      <aside className="w-60 border-r border-border p-4 flex flex-col gap-1">
        <div className="text-lg font-semibold mb-6 px-2">Finance Hub</div>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-surface text-text"
                  : "text-text-muted hover:bg-surface hover:text-text"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
