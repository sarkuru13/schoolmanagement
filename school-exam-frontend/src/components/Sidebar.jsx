import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    navigate("/");
  };

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-10">Admin Panel</h2>

      <ul className="space-y-4 flex-1">
        <li>
          <Link
            to="/admin"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </li>

        <li>
          <Link
            to="/admin/classes"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Classes
          </Link>
        </li>

        <li>
          <Link
            to="/admin/subjects"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Subjects
          </Link>
        </li>

        <li>
          <Link
            to="/admin/teachers"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Teachers
          </Link>
        </li>

        <li>
          <Link
            to="/admin/students"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Students
          </Link>
        </li>

        <li>
          <Link
            to="/admin/results"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Results
          </Link>
        </li>
      </ul>

      <div className="pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-400 rounded-lg hover:bg-gray-800 hover:text-red-300 transition-colors"
        >
          <svg
            className="mr-3 h-5 w-5 text-red-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}