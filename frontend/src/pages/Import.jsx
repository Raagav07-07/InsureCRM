import API from "../services/api";
import { useState } from "react";

export default function Import() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const response = await API.post("/upload", formData);
      const count = response?.data?.records_created;
      setMessage(
        typeof count === "number"
          ? `Upload complete. ${count} records created.`
          : "Upload complete.",
      );
    } catch {
      setError("Upload failed. Please verify file format and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="max-w-2xl rounded-2xl border border-slate-800/70 bg-slate-900/65 p-4 shadow-[0_8px_30px_rgba(2,6,23,0.45)] sm:p-6">
      <h2 className="text-xl font-semibold text-slate-100">Import Policies</h2>
      <p className="mt-1 text-sm text-slate-300">
        Upload CSV or Excel files to create clients and policies in bulk.
      </p>

      {message && (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="mt-4 rounded-lg border border-dashed border-slate-700 bg-slate-950/70 p-6 text-center">
        <input type="file" onChange={handleUpload} className="text-sm text-slate-300" />
        {uploading && <p className="mt-3 text-sm text-slate-400">Uploading...</p>}
      </div>
    </section>
  );
}
