import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // PREVENT CRASHES BY GIVING DEFAULT VALUES TO STATS
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0
  });

  useEffect(() => {
    // Protect the route: if no token, send back to login
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/admin/dashboard-stats");
      
      // Safely update stats with whatever the backend returns
      if (res.data) {
        setStats((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      // Automatically log out if the token expired (401 or 403)
      if (err.response?.status === 401 || err.response?.status === 403) {
         localStorage.removeItem("token");
         localStorage.removeItem("role");
         navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-pulse">
        <div className="text-gray-500 font-medium">Loading Dashboard Data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-2">Overview of your institution.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Students */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Students</p>
            <p className="text-2xl font-bold text-gray-900">{stats.students || 0}</p>
          </div>
        </div>

        {/* Card 2: Teachers */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mr-4">
             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
             </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Teachers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.teachers || 0}</p>
          </div>
        </div>

        {/* Card 3: Classes */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mr-4">
             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
             </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Classes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.classes || 0}</p>
          </div>
        </div>

        {/* Card 4: Subjects */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="h-12 w-12 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center mr-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Subjects</p>
            <p className="text-2xl font-bold text-gray-900">{stats.subjects || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}