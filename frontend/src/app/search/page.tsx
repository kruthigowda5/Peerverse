"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchSessions } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("query") || "";
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!query.trim()) { setResults([]); return; }
      setLoading(true);
      const res = await searchSessions(query);
      const items = Array.isArray(res) ? res : (res.results || []);
      if (!ignore) setResults(items);
      setLoading(false);
    }
    run();
    return () => { ignore = true; };
  }, [query]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold">Search results</h1>
      <p className="text-sm text-gray-600">Results for '{query}'</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="text-gray-600 mt-6">No results found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {results.map((s: any) => (
            <a key={s.id} href={`/session/${s.id}`} className="border rounded-xl p-4 hover:shadow-sm transition">
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-gray-500 mt-1">{typeof s.skill === 'string' ? s.skill : (s.skill?.name || '')}</p>
              <p className="text-xs text-gray-500">{typeof s.created_by === 'string' ? s.created_by : (s.created_by?.username || '')}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
