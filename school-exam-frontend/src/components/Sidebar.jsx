import { NavLink, useNavigate } from "react-router-dom";
import API from "../api/axios";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/classes", label: "Classes" },
  { to: "/admin/subjects", label: "Subjects" },
  { to: "/admin/teachers", label: "Teachers" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/results", label: "Results" },
  { to: "/admin/reexam-requests", label: "Re-exams" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch {
      // Ignore logout API failures and still clear local client state.
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      navigate("/");
    }
  };

  return (
    <aside className="w-72 h-screen shrink-0 bg-slate-950 text-white flex flex-col border-r border-slate-800">
      <div className="px-6 py-6 border-b border-slate-800">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Administration</p>
        <h2 className="text-2xl font-black tracking-tight mt-2">School Exam System</h2>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
