import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono text-sm font-bold text-slate-700 mb-4">
        404
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        Studio Resource Not Found
      </h2>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The requested studio route or media asset could not be located.
      </p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 rounded-xl bg-[#140F35] hover:bg-[#221B52] text-white text-xs font-bold transition-all shadow-sm"
      >
        Return to Studio
      </Link>
    </div>
  );
}
