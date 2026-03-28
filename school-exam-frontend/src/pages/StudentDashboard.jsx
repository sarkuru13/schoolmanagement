import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const isExamMode = /^\/student\/exams\/[^/]+\/take$/.test(location.pathname);

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

  const navLinks = [
    { name: "Dashboard", path: "/student/dashboard" },
    { name: "My subjects", path: "/student/subjects" },
    { name: "My exams", path: "/student/exams" },
    { name: "Results", path: "/student/results" },
  ];

  const isActive = (path) => {
    if (path === "/student/dashboard") {
      return location.pathname === "/student" || location.pathname === "/student/dashboard";
    }
    if (path === "/student/exams") {
      return location.pathname.startsWith("/student/exams");
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  if (isExamMode) {
    return (
      <main className="min-h-screen bg-slate-950">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden sm:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-lg font-bold text-indigo-700 tracking-tight">Student Portal</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive(link.path) ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
