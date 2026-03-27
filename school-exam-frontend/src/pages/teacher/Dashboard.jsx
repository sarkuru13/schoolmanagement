import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function TeacherDashboardHome() {
  const [stats, setStats] = useState({
    classes: 0,
    subjects: 0,
    students: 0
  });

  // Simulated fetch data logic (Replace with your actual API endpoint later)
  useEffect(() => {
    // Example: fetch teacher's overview stats
    // const res = await API.get("/teacher/stats"); 
    // setStats(res.data);
    setStats({ classes: 4, subjects: 3, students: 120 });
  }, []);

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto animate-fade-in">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome back, Teacher!
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Here is an overview of your schedule and classes for today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Assigned Classes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.classes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mr-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Subjects</p>
            <p className="text-2xl font-bold text-gray-900">{stats.subjects}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mr-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions / Recent Activity Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">My Recent Classes</h2>
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-500">Your class roster will appear here once assignments are loaded.</p>
        </div>
      </div>

    </div>
  );
}