import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "./pages/Login";
import RegisterAdmin from "./pages/RegisterAdmin";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/admin/Dashboard";
import Classes from "./pages/admin/Classes";
import Subjects from "./pages/admin/Subjects";
import Teachers from "./pages/admin/Teachers";
import Students from "./pages/admin/Students";
import Results from "./pages/admin/Results";
import ReexamRequests from "./pages/admin/ReexamRequests";

// Teacher
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherDashboardHome from "./pages/teacher/Dashboard";
import TeacherClasses from "./pages/teacher/Classes";
import TeacherExams from "./pages/teacher/Exams";
import ExamCreate from "./pages/teacher/ExamCreate";
import ExamDetail from "./pages/teacher/ExamDetail";

// Student
import StudentDashboard from "./pages/StudentDashboard";
import StudentDashboardHome from "./pages/student/Dashboard";
import StudentExams from "./pages/student/Exams";
import ExamTake from "./pages/student/ExamTake";
import StudentResults from "./pages/student/Results";
import StudentSubjects from "./pages/student/Subjects";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />

        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="classes" element={<Classes />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="students" element={<Students />} />
          <Route path="results" element={<Results />} />
          <Route path="reexam-requests" element={<ReexamRequests />} />
        </Route>

        <Route path="/teacher" element={<TeacherDashboard />}>
          <Route index element={<TeacherDashboardHome />} />
          <Route path="dashboard" element={<TeacherDashboardHome />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="exams" element={<TeacherExams />} />
          <Route path="exams/new" element={<ExamCreate />} />
          <Route path="exams/:id" element={<ExamDetail />} />
        </Route>

        <Route path="/student" element={<StudentDashboard />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardHome />} />
          <Route path="subjects" element={<StudentSubjects />} />
          <Route path="exams" element={<StudentExams />} />
          <Route path="exams/:id/take" element={<ExamTake />} />
          <Route path="results" element={<StudentResults />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
