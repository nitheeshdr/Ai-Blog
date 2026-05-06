"use client";
export function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:border-indigo-300 transition-all"
    >
      Refresh
    </button>
  );
}
