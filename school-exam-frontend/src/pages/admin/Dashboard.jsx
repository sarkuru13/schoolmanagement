import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0,
    exams: 0,
    submissions: 0,
    pending_reexam_requests: 0,
    recent_reexam_requests: [],
  });

  useEffect(() => {
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
      if (res.data) {
        setStats((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
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
      <div className="p-8 sm:p-10">
        <div className="text-gray-500 font-medium">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="p-8 sm:p-10 max-w-7xl mx-auto">
      <div className="rounded-[2rem] bg-slate-950 text-white p-8 shadow-xl">
        <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Admin overview</p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-3">Professional control center</h1>
        <p className="text-sm text-slate-300 mt-3 max-w-3xl">
          Monitor the full exam system, manage users, release results, and track re-exam approvals from one place.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link to="/admin/results" className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Open results
          </Link>
          <Link
            to="/admin/reexam-requests"
            className="px-5 py-3 rounded-xl border border-slate-700 text-slate-100 font-semibold hover:bg-slate-900"
          >
            Review re-exams
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
        <MetricCard title="Students" value={stats.students} tone="blue" />
        <MetricCard title="Teachers" value={stats.teachers} tone="violet" />
        <MetricCard title="Classes" value={stats.classes} tone="emerald" />
        <MetricCard title="Subjects" value={stats.subjects} tone="amber" />
        <MetricCard title="Exams" value={stats.exams} tone="slate" />
        <MetricCard title="Submissions" value={stats.submissions} tone="cyan" />
        <MetricCard title="Pending re-exams" value={stats.pending_reexam_requests} tone="rose" />
        <MetricCard title="System status" value="Live" tone="lime" />
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 mt-6">
        <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="text-xl font-bold text-gray-900">Recent re-exam activity</h2>
            <Link to="/admin/reexam-requests" className="text-sm font-semibold text-blue-600 hover:underline">
              Open queue
            </Link>
          </div>

          {stats.recent_reexam_requests?.length ? (
            <div className="space-y-4">
              {stats.recent_reexam_requests.map((request) => (
                <div key={request.id} className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900">{request.student_name}</p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        request.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : request.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{request.exam_title}</p>
                  <p className="text-xs text-gray-500 mt-1">Teacher: {request.teacher_name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No re-exam requests yet.</p>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Quick actions</h2>
          <div className="space-y-3">
            <QuickLink to="/admin/teachers" title="Manage teachers" body="View all teachers, assign them, and reset passwords." />
            <QuickLink to="/admin/students" title="Manage students" body="Update student records and reset student passwords." />
            <QuickLink to="/admin/subjects" title="Manage subjects" body="Upload syllabus links and organize class subjects." />
            <QuickLink to="/admin/results" title="Release results" body="Export scores and publish exam results." />
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ title, value, tone }) {
  const tones = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    violet: "bg-violet-50 border-violet-100 text-violet-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    cyan: "bg-cyan-50 border-cyan-100 text-cyan-700",
    rose: "bg-rose-50 border-rose-100 text-rose-700",
    lime: "bg-lime-50 border-lime-100 text-lime-700",
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${tones[tone] || tones.slate}`}>
      <p className="text-xs font-bold uppercase tracking-[0.24em]">{title}</p>
      <p className="text-3xl font-black mt-3">{value}</p>
    </div>
  );
}

function QuickLink({ to, title, body }) {
  return (
    <Link to={to} className="block rounded-2xl border border-gray-200 px-4 py-4 hover:bg-gray-50">
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 mt-1">{body}</p>
    </Link>
  );
}
