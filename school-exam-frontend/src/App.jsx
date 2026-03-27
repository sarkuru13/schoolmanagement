import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "./pages/Login";
import RegisterAdmin from "./pages/RegisterAdmin";

// Admin
import AdminDashboard from "./pages/AdminDashboard"; // Admin Layout Wrapper
import Dashboard from "./pages/admin/Dashboard";
import Classes from "./pages/admin/Classes";
import Subjects from "./pages/admin/Subjects";
import Teachers from "./pages/admin/Teachers";
import Students from "./pages/admin/Students";
import Results from "./pages/admin/Results";

// Teacher
import TeacherDashboard from "./pages/TeacherDashboard"; // Teacher Layout Wrapper
import TeacherDashboardHome from "./pages/teacher/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />

        {/* --- Admin Routes --- */}
        <Route path="/admin" element={<AdminDashboard />}>
          {/* THIS LINE FIXES THE BLANK PAGE: It auto-redirects /admin to /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="classes" element={<Classes />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="students" element={<Students />} />
          <Route path="results" element={<Results />} />
        </Route>

        {/* --- Teacher Routes --- */}
        <Route path="/teacher" element={<TeacherDashboard />}>
          {/* Default redirect for /teacher goes to /teacher/dashboard */}
          <Route index element={<TeacherDashboardHome />} />
          <Route path="dashboard" element={<TeacherDashboardHome />} />
          {/* Add more teacher routes here like "classes" or "exams" in the future */}
        </Route>

      </Routes>
    </BrowserRouter>
  );
}