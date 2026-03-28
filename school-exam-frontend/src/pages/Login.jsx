import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await API.get("/auth/me");
        if (cancelled || !res.data?.role) return;

        localStorage.setItem("role", res.data.role);
        if (res.data.name) {
          localStorage.setItem("userName", res.data.name);
        }

        if (res.data.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (res.data.role === "teacher") {
          navigate("/teacher/dashboard", { replace: true });
        } else if (res.data.role === "student") {
          navigate("/student/dashboard", { replace: true });
        }
      } catch {
        // No active session found, stay on the login page.
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      
      // Assuming your backend returns { token, role, user: {...} }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      if (res.data.name) {
        localStorage.setItem("userName", res.data.name);
      } else {
        localStorage.removeItem("userName");
      }

      // Redirect based on the authenticated user's role
      if (res.data.role === "admin") {
        navigate("/admin/dashboard");
      } else if (res.data.role === "teacher") {
        navigate("/teacher/dashboard");
      } else if (res.data.role === "student") {
        navigate("/student/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-[0.25em]">Session</p>
          <p className="text-xl font-bold text-gray-900 mt-3">Checking your login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-fade-in">
        
        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-purple-600 rounded-xl mx-auto flex items-center justify-center shadow-md mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-2">Sign in to your school account</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-shadow bg-gray-50 focus:bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@school.edu"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-shadow bg-gray-50 focus:bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm disabled:opacity-70 flex justify-center"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

      </div>
    </div>
  );
}
