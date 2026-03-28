import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminDashboard() {
  return (
    <div className="h-screen bg-slate-100 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
