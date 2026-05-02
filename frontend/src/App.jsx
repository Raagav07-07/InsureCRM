import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

// Pages
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Policies from "./pages/Policies";
import Import from "./pages/Import";
import Reminders from "./pages/Reminders";
import Analytics from "./pages/Analytics";

// Components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { setAuthToken } from "./services/api";

// 🔐 Protected Route Wrapper
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

// 🧱 Main Layout (Sidebar + Header)
function Layout({ children }) {
  return (
    <div className="min-h-screen text-slate-100">
      <Sidebar />

      <div className="lg:pl-72">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setAuthToken(token);
    }
  }, []);

  return (
    <Router>
      <Routes>

        {/* 🔐 Login */}
        <Route
          path="/login"
          element={
            localStorage.getItem("token") ? <Navigate to="/" replace /> : <Login />
          }
        />

        {/* 🔒 Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <Layout>
                <Clients />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/policies"
          element={
            <ProtectedRoute>
              <Layout>
                <Policies />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/import"
          element={
            <ProtectedRoute>
              <Layout>
                <Import />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reminders"
          element={
            <ProtectedRoute>
              <Layout>
                <Reminders />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}
