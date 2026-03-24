import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetching all data concurrently for maximum speed
      const [studentsRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
        API.get("/admin/students").catch(() => ({ data: [] })),
        API.get("/admin/teachers").catch(() => ({ data: [] })),
        API.get("/admin/classes").catch(() => ({ data: [] })),
        API.get("/admin/subjects").catch(() => ({ data: [] })),
      ]);

      setStats({
        students: studentsRes.data?.length || 0,
        teachers: teachersRes.data?.length || 0,
        classes: classesRes.data?.length || 0,
        subjects: subjectsRes.data?.length || 0,
      });
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- LOGOUT ---------- */
  const handleLogout = () => {
    const isConfirmed = window.confirm("Are you sure you want to log out?");
    if (isConfirmed) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  // Get today's date formatted nicely
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            School Management System
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Welcome back, Admin. Here is your daily overview.
          </p>
        </div>
        
        {/* TOP RIGHT: Logout & Date */}
        <div className="flex flex-col items-end gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-300 hover:border-red-200 px-4 py-1.5 rounded-lg transition-all duration-200 font-medium text-sm shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
          
          <div className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 shadow-sm">
            {today}
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Students Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.students}
            </h3>
          </div>
        </div>

        {/* Total Teachers Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-full bg-purple-50 text-purple-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Faculty</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.teachers}
            </h3>
          </div>
        </div>

        {/* Total Classes Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-full bg-green-50 text-green-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Registered Classes</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.classes}
            </h3>
          </div>
        </div>

        {/* Total Subjects Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Curriculum Subjects</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : stats.subjects}
            </h3>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: QUICK ACTIONS & INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <a href="/admin/students" className="block p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-colors group">
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">Add New Student</h4>
              <p className="text-sm text-gray-500 mt-1">Enroll a new student into the school system.</p>
            </a>

            <a href="/admin/teachers" className="block p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-purple-50 hover:border-purple-100 transition-colors group">
              <h4 className="font-semibold text-gray-900 group-hover:text-purple-700">Assign Faculty</h4>
              <p className="text-sm text-gray-500 mt-1">Manage teacher subject allocations and schedules.</p>
            </a>

            <a href="/admin/classes" className="block p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-100 transition-colors group">
              <h4 className="font-semibold text-gray-900 group-hover:text-green-700">Manage Classes</h4>
              <p className="text-sm text-gray-500 mt-1">Create or update school class structures.</p>
            </a>

            <button onClick={fetchDashboardData} className="text-left w-full block p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
              <h4 className="font-semibold text-gray-900">Refresh Statistics</h4>
              <p className="text-sm text-gray-500 mt-1">Manually sync dashboard data with the database.</p>
            </button>

          </div>
        </div>

        {/* School Notice Board */}
        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 className="text-lg font-bold">School Updates</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/20">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Reminder</span>
              <p className="text-sm mt-1 text-blue-50">Ensure all faculty assignments strictly follow the updated school guidelines for this academic session.</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/20">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">System Info</span>
              <p className="text-sm mt-1 text-blue-50">Database backups are scheduled for every Sunday at 02:00 AM.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}