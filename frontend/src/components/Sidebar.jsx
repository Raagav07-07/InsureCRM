import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/clients", label: "Clients" },
  { to: "/policies", label: "Policies" },
  { to: "/import", label: "Import" },
  { to: "/reminders", label: "Reminders" },
  { to: "/analytics", label: "Analytics" },
];

export default function Sidebar() {
  const baseNavClass =
    "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-800/60 bg-slate-950/70 p-6 backdrop-blur-xl lg:block">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
          InsureCRM
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-100">Operations Hub</h1>
        <p className="mt-2 text-xs text-slate-400">Revenue, renewals, and client lifecycle in one workspace.</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `${baseNavClass} ${
                isActive
                  ? "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/40"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-slate-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
