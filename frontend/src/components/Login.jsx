import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../services/supabase";
import { setAuthToken } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sessionExpired = params.get("expired") === "1";

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data?.session) {
      localStorage.setItem("token", data.session.access_token);
      setAuthToken(data.session.access_token);
      navigate("/");
      return;
    }

    setError("Could not create a session. Please try again.");
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-900/90 p-8 shadow-2xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
          InsureCRM
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-300">Sign in to manage your insurance operations.</p>

        {sessionExpired && (
          <p className="mt-4 rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-sm text-amber-200">
            Session expired. Please log in again.
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-rose-300/40 bg-rose-300/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-3">
          <label className="block text-sm font-medium text-slate-200" htmlFor="email">
            Email
          </label>
        <input
          id="email"
          type="email"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none transition focus:border-sky-400"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

          <label className="block text-sm font-medium text-slate-200" htmlFor="password">
            Password
          </label>
        <input
          id="password"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none transition focus:border-sky-400"
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-sky-500 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </div>
  );
}
