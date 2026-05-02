import { useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { setAuthToken } from "../services/api";

const pageTitles = {
  "/": "Dashboard",
  "/clients": "Clients",
  "/policies": "Policies",
  "/import": "Import",
  "/reminders": "Reminders",
  "/analytics": "Analytics",
};

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/clients", label: "Clients" },
  { to: "/policies", label: "Policies" },
  { to: "/import", label: "Import" },
  { to: "/reminders", label: "Reminders" },
  { to: "/analytics", label: "Analytics" },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const title = useMemo(
    () => pageTitles[location.pathname] || "Workspace",
    [location.pathname],
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800/60 bg-slate-950/50 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Insurance SaaS
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-100">{title}</h2>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          Logout
        </button>
      </div>

      <nav className="mx-auto mt-4 flex max-w-7xl gap-2 overflow-x-auto pb-1 lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/40"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
