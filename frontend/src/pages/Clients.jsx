import API from "../services/api";
import { useEffect, useState } from "react";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await API.get("/clients");
      setClients(res.data);
    } catch {
      setError("Unable to load clients. / வாடிக்கையாளர்களை ஏற்ற முடியவில்லை.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      setSubmitting(true);
      setError("");
      await API.post("/clients", form);
      setForm({ name: "", phone: "", email: "", notes: "" });
      setShowForm(false);
      await fetchClients();
    } catch {
      setError("Could not create client. / வாடிக்கையாளரை உருவாக்க முடியவில்லை.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-6 text-slate-300">Loading clients... / வாடிக்கையாளர்களை ஏற்றுகிறது...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-4 shadow-[0_8px_30px_rgba(2,6,23,0.45)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100">
            Clients <span className="text-sm font-normal text-slate-400">/ வாடிக்கையாளர்கள்</span>
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-300"
          >
            {showForm ? "Cancel" : "+ Add Client"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-4 grid gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 md:grid-cols-2">
            <input
              className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
              placeholder="Name / பெயர்"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
              placeholder="Phone / தொலைபேசி"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
              type="email"
              placeholder="Email / மின்னஞ்சல்"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
              placeholder="Notes / குறிப்புகள்"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60 md:col-span-2"
            >
              {submitting ? "Adding..." : "Add Client"}
            </button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="px-3 py-2 font-medium">Name / பெயர்</th>
                <th className="px-3 py-2 font-medium">Phone / தொலைபேசி</th>
                <th className="px-3 py-2 font-medium">Email / மின்னஞ்சல்</th>
                <th className="px-3 py-2 font-medium">Notes / குறிப்புகள்</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/70">
                  <td className="px-3 py-3 text-slate-100">{c.name}</td>
                  <td className="px-3 py-3 text-slate-300">{c.phone || "-"}</td>
                  <td className="px-3 py-3 text-slate-300">{c.email || "-"}</td>
                  <td className="px-3 py-3 text-slate-300">{c.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clients.length === 0 && (
          <p className="mt-4 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
            No clients found. Click "+ Add Client" to create one. / வாடிக்கையாளர்கள் இல்லை. "+ Add Client" என்பதைக் கிளிக் செய்யவும்.
          </p>
        )}
      </section>
    </div>
  );
}
