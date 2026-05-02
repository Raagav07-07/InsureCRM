export default function InfoTooltip({ label = "i", title, en, ta }) {
  return (
    <details className="group relative inline-block">
      <summary className="flex h-5 w-5 cursor-pointer list-none items-center justify-center rounded-full border border-slate-500 bg-slate-800 text-[11px] font-semibold text-slate-200 transition hover:border-slate-400 hover:text-white">
        {label}
      </summary>

      <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-200 shadow-2xl">
        <p className="font-semibold text-slate-100">{title}</p>
        <p className="mt-2 leading-relaxed text-slate-300">{en}</p>
        <div className="my-2 h-px bg-slate-700" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Tamil / தமிழ்</p>
        <p className="leading-relaxed text-slate-300">{ta}</p>
      </div>
    </details>
  );
}
