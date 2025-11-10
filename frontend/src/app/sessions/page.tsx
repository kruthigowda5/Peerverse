"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSessions, type Session } from "@/lib/api";
import { Input } from "@/components/ui/input";

export default function SessionsPage() {
  const params = useSearchParams();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getSessions();
      setSessions(data);
      setLoading(false);
    })();
  }, []);

  // Base list for micro-sessions (<= 60 minutes)
  const microSessions = useMemo(() => {
    const toMinutes = (s: any): number | undefined => {
      if (typeof s?.duration === "number") return s.duration;
      const start = s?.start_time ? Date.parse(s.start_time) : NaN;
      const end = s?.end_time ? Date.parse(s.end_time) : NaN;
      if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
        return Math.round((end - start) / 60000);
      }
      return undefined;
    };
    return sessions.filter((s: any) => {
      const mins = toMinutes(s);
      return typeof mins === "number" ? mins <= 60 : true;
    });
  }, [sessions]);

  // Apply search over micro-sessions only
  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return microSessions;
    return microSessions.filter((s: any) => {
      const title = String(s?.title || "").toLowerCase();
      const desc = String(s?.description || "").toLowerCase();
      const tags: string[] = Array.isArray(s?.tags) ? s.tags : [];
      const tagsText = tags.join(" ").toLowerCase();
      return title.includes(q) || desc.includes(q) || tagsText.includes(q);
    });
  }, [microSessions, query]);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-10">Loading sessions...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Explore Sessions</h1>
      <div className="max-w-[600px] mx-auto mt-4 mb-8">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for micro-sessions…"
          className="w-full h-11 rounded-full pl-4 border shadow-sm"
        />
      </div>

      {displayed.length === 0 ? (
        <p className="text-center text-gray-600">No micro-sessions found for this search.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((s) => (
            <Link key={s.id} href={`/session/${s.id}`} className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition">
              <h3 className="font-medium text-lg mb-1">{s.title}</h3>
              <p className="text-sm text-gray-600 mb-1">{typeof s.skill === 'string' ? s.skill : s.skill?.name}</p>
              <p className="text-xs text-gray-500">By {typeof s.created_by === 'string' ? s.created_by : (s.created_by as any)?.username}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
