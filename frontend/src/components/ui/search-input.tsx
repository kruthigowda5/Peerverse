"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { searchSessions } from "@/lib/api";
import { Spinner } from "./spinner";

export function SearchInput() {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [results, setResults] = React.useState<any[]>([]);
  const ref = React.useRef<HTMLDivElement | null>(null);

  // Close on click outside
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await searchSessions(q.trim());
      const items = Array.isArray(res) ? res : (res.results || []);
      setResults(items.slice(0, 6));
      setOpen(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?query=${encodeURIComponent(term)}`);
  };

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <form onSubmit={onSubmit}>
        <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-white text-sm focus-within:ring-2 focus-within:ring-indigo-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search skills or sessions…"
            className="w-full outline-none placeholder:text-gray-400"
          />
          {loading && <Spinner className="h-4 w-4" />}
        </div>
      </form>

      {open && results.length > 0 && (
        <div className="absolute z-40 mt-1 w-full rounded-md border bg-white shadow">
          <ul className="max-h-72 overflow-auto divide-y">
            {results.map((s: any) => (
              <li key={s.id} className="px-3 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/session/${s.id}`)}>
                <p className="text-sm font-medium text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500">{typeof s.skill === 'string' ? s.skill : (s.skill?.name || '')}</p>
              </li>
            ))}
          </ul>
          <button onClick={() => router.push(`/search?query=${encodeURIComponent(q.trim())}`)} className="w-full text-left px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50">View all results</button>
        </div>
      )}
    </div>
  );
}
