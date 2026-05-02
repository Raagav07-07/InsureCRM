import { useEffect, useState } from "react";
import API from "../services/api";

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [payingPolicyId, setPayingPolicyId] = useState(null);

  const [form, setForm] = useState({
    client_id: "",
    policy_number: "",
    insurer_name: "LIC",
    custom_insurer_name: "",
    policy_type: "",
    premium_amount: "",
    frequency: "yearly",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [policiesResponse, clientsResponse] = await Promise.all([
          API.get("/policies"),
          API.get("/clients"),
        ]);

        setPolicies(policiesResponse.data);
        setClients(clientsResponse.data);
      } catch {
        setError("Unable to load policies data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchPolicies = async () => {
    const response = await API.get("/policies");
    setPolicies(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.client_id) {
      setError("Please select a client.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await API.post("/policies", {
        ...form,
        insurer_name:
          form.insurer_name === "Other"
            ? form.custom_insurer_name.trim() || "Other"
            : form.insurer_name,
        premium_amount: Number(form.premium_amount),
        end_date: form.end_date || null,
      });

      setForm({
        client_id: "",
        policy_number: "",
        insurer_name: "LIC",
        custom_insurer_name: "",
        policy_type: "",
        premium_amount: "",
        frequency: "yearly",
        start_date: "",
        end_date: "",
      });

      await fetchPolicies();
    } catch {
      setError("Could not create policy. Please verify the form and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (policyId) => {
    try {
      setPayingPolicyId(policyId);
      setError("");
      await API.post(`/policies/${policyId}/pay`, {});
      await fetchPolicies();
    } catch {
      setError("Could not record payment for this policy.");
    } finally {
      setPayingPolicyId(null);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-6 text-slate-300">Loading policies...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-4 shadow-[0_8px_30px_rgba(2,6,23,0.45)] sm:p-6">
        <h2 className="mb-4 text-xl font-semibold text-slate-100">Add Policy</h2>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <select
            className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
            value={form.client_id}
            onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            required
          >
            <option value="">Select Client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>

          <input
            className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
            placeholder="Policy Number / பாலிசி எண்"
            value={form.policy_number}
            onChange={(e) => setForm({ ...form, policy_number: e.target.value })}
          />

          <select
            className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
            value={form.insurer_name}
            onChange={(e) => setForm({ ...form, insurer_name: e.target.value })}
          >
            <option value="LIC">LIC</option>
            <option value="Star Health">Star Health</option>
            <option value="Other">Other</option>
          </select>

          {form.insurer_name === "Other" && (
            <input
              className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
              placeholder="Enter insurer name"
              value={form.custom_insurer_name}
              onChange={(e) => setForm({ ...form, custom_insurer_name: e.target.value })}
              required
            />
          )}

          <input
            className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
            placeholder="Policy Type"
            value={form.policy_type}
            onChange={(e) => setForm({ ...form, policy_type: e.target.value })}
            required
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
            type="number"
            placeholder="Premium Amount"
            value={form.premium_amount}
            onChange={(e) => setForm({ ...form, premium_amount: e.target.value })}
            required
          />

          <select
            className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          >
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
          </select>

          <div className="relative">
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">
              Start Date / தொடக்க தேதி
            </label>
            <input
              className="date-input w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 pr-9 text-sm text-slate-100 outline-none focus:border-sky-500"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
            />
            <svg className="pointer-events-none absolute right-3 top-[2.15rem] h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <div className="relative">
            <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">
              End Date / முடிவு தேதி
            </label>
            <input
              className="date-input w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 pr-9 text-sm text-slate-100 outline-none focus:border-sky-500"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
            <svg className="pointer-events-none absolute right-3 top-[2.15rem] h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2 xl:col-span-3"
          >
            {submitting ? "Creating..." : "Create Policy"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-4 shadow-[0_8px_30px_rgba(2,6,23,0.45)] sm:p-6">
        <h3 className="mb-4 text-xl font-semibold text-slate-100">Policy List</h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="px-3 py-2 font-medium">Policy #</th>
                <th className="px-3 py-2 font-medium">Client</th>
                <th className="px-3 py-2 font-medium">Insurer</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Premium</th>
                <th className="px-3 py-2 font-medium">Frequency</th>
                <th className="px-3 py-2 font-medium">Start Date</th>
                <th className="px-3 py-2 font-medium">End Date</th>
                <th className="px-3 py-2 font-medium">Next Due</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {policies.map((p) => {
                const client = clients.find((c) => c.id === p.client_id);

                const status = p.status || "active";
                const statusClass =
                  status === "active"
                    ? "rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300 border border-emerald-500/30"
                    : status === "lapsed"
                    ? "rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300 border border-amber-500/30"
                    : "rounded-md bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-300 border border-rose-500/30";

                return (
                  <tr key={p.id} className="border-b border-slate-800/70">
                    <td className="px-3 py-3 font-mono text-[11px] text-slate-300">{p.policy_number || "-"}</td>
                    <td className="px-3 py-3 text-slate-100">{client ? client.name : "Unknown"}</td>
                    <td className="px-3 py-3 text-slate-300">{p.insurer_name}</td>
                    <td className="px-3 py-3 text-slate-300">{p.policy_type}</td>
                    <td className="px-3 py-3 text-slate-300">{p.premium_amount}</td>
                    <td className="px-3 py-3 text-slate-300">{p.frequency}</td>
                    <td className="px-3 py-3 text-slate-300">{p.start_date || "-"}</td>
                    <td className="px-3 py-3 text-slate-300">{p.end_date || "-"}</td>
                    <td className="px-3 py-3">
                      <span className={statusClass}>{status}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-300">{p.next_due_date}</td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        disabled={payingPolicyId === p.id}
                        onClick={() => handleMarkPaid(p.id)}
                        className="rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {payingPolicyId === p.id ? "Updating..." : "Mark Paid"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {policies.length === 0 && (
          <p className="mt-4 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
            No policies found.
          </p>
        )}
      </section>
    </div>
  );
}
