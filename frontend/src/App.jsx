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
    <div className="flex min-h-screen flex-col text-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col lg:pl-72">
        <Header />
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        <footer className="border-t border-slate-800/70 py-4 text-center text-[11px] text-slate-500">
          <p>
            Developed by{" "}
            <span className="font-medium text-slate-400">Thiru Raagavendran</span>
          </p>
          <p className="mt-0.5">
            <a
              href="mailto:raagavendranselvaraj@gmail.com"
              className="text-sky-500 transition hover:text-sky-400"
            >
              raagavendranselvaraj@gmail.com
            </a>
          </p>
        </footer>
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
