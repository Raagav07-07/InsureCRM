import API from "../services/api";
import { useEffect, useState } from "react";
import InfoTooltip from "../components/InfoTooltip";

const typeBadge = (type) => {
  if (type === "lapse")
    return "rounded-md bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-300 border border-rose-500/30";
  if (type === "renewal")
    return "rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300 border border-amber-500/30";
  return "rounded-md bg-slate-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-300 border border-slate-500/30";
};

const daysLabel = (days) => {
  if (days == null) return "No date";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  return `${days}d left`;
};

const daysLabelTA = (days) => {
  if (days == null) return "தேதி இல்லை";
  if (days < 0) return `${Math.abs(days)} நாள் தாமதம்`;
  if (days === 0) return "இன்று செலுத்த வேண்டும்";
  return `${days} நாள் மீதம்`;
};

function ReminderCard({ r, onDismiss }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-100">{r.client_name}</p>
          <p className="text-xs text-slate-400">/ {r.client_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={typeBadge(r.type)}>{r.type}</span>
          <button
            onClick={() => onDismiss(r.id)}
            className="shrink-0 rounded border border-slate-600 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-400 hover:text-white"
            title="Dismiss / நிராகரி"
          >
            Dismiss
          </button>
        </div>
      </div>

      <div className="grid gap-x-6 gap-y-2 text-sm md:grid-cols-2">
        <Field label="Phone" labelTa="தொலைபேசி" value={r.client_phone} />
        <Field label="Policy Number" labelTa="பாலிசி எண்" value={r.policy_number} />
        <Field label="Insurer" labelTa="காப்பீட்டாளர்" value={r.insurer_name} />
        <Field label="Type" labelTa="வகை" value={r.policy_type} />
        <Field label="Premium" labelTa="பிரீமியம்" value={`Rs. ${r.premium_amount}`} />
        <Field label="Frequency" labelTa="அதிர்வெண்" value={r.frequency} />
        <Field label="Next Due" labelTa="அடுத்த தேதி" value={r.reminder_date} />
        <Field label="Status" labelTa="நிலை" value={r.status} />
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-slate-700 pt-2 text-[11px] text-slate-400">
        <span className={typeBadge(r.type)}>{daysLabel(r.days_left)}</span>
        <span className="text-[10px] text-slate-500">{daysLabelTA(r.days_left)}</span>
        {r.commission_info && (
          <span className="text-slate-500">| {r.commission_info}</span>
        )}
      </div>
    </div>
  );
}

function Field({ label, labelTa, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {label} / {labelTa}
      </p>
      <p className="text-slate-200">{value || "-"}</p>
    </div>
  );
}

export default function Reminders() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/reminders");
      setData(res.data);
    } catch {
      setError("Unable to load reminders. / நினைவூட்டல்களை ஏற்ற முடியவில்லை.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleDismiss = async (id) => {
    try {
      await API.post(`/reminders/${id}/dismiss`);
      setData((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Could not dismiss reminder. / நினைவூட்டலை நிராகரிக்க முடியவில்லை.");
    }
  };

  const grouped = {
    lapse: data.filter((r) => r.type === "lapse"),
    renewal: data.filter((r) => r.type === "renewal"),
    manual: data.filter((r) => r.type === "manual"),
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-6 text-slate-300">
        Loading reminders... / நினைவூட்டல்களை ஏற்றுகிறது...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  const total = data.length;

  return (
    <section className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-4 shadow-[0_8px_30px_rgba(2,6,23,0.45)] sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-100">
          Reminders{" "}
          <span className="text-sm font-normal text-slate-400">/ நினைவூட்டல்கள்</span>
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {total} total / மொத்தம்
          </span>
          <InfoTooltip
            label="i"
            title="Reminders / நினைவூட்டல்கள்"
            en="Auto-generated from policies due within 30 days or already past due. Shows client name, phone, policy number, insurer, premium, and commission info."
            ta="30 நாட்களுக்குள் வரவுள்ள அல்லது தவறிய பாலிசிகளிலிருந்து தானாக உருவாக்கப்பட்டது. வாடிக்கையாளர் பெயர், தொலைபேசி, பாலிசி எண், காப்பீட்டாளர், பிரீமியம் மற்றும் கமிஷன் தகவல் காட்டப்படும்."
          />
        </div>
      </div>

      {total === 0 && (
        <p className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
          No reminders. All policies are on track. / நினைவூட்டல்கள் இல்லை. அனைத்து பாலிசிகளும் சரியான நிலையில் உள்ளன.
        </p>
      )}

      {["lapse", "renewal", "manual"].map((group) => {
        const items = grouped[group];
        if (!items.length) return null;

        const groupTitle =
          group === "lapse"
            ? "Lapsed / காலாவதி"
            : group === "renewal"
            ? "Upcoming Renewal / வரவுள்ள புதுப்பிப்பு"
            : "Manual / கைமுறை";

        return (
          <div key={group} className="mb-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {groupTitle}
              <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-500">
                {items.length}
              </span>
            </h3>
            <div className="space-y-3">
              {items.map((r) => (
                <ReminderCard key={r.id} r={r} onDismiss={handleDismiss} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
