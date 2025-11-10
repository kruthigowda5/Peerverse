"use client";

import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { getBadges } from "@/lib/api";

type BadgeItem = { name: string; criteria?: string; description?: string };

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await getBadges();
        const normalized: BadgeItem[] = Array.isArray(list)
          ? list.map((b: any) => ({ name: b.name, criteria: b.criteria || b.description }))
          : [];
        setBadges(normalized);
      } catch (e: any) {
        setError("Unable to load badges right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">🎖️ Badges & Rewards</h1>
        <p className="text-sm text-gray-600 mt-1">Track your achievements and see how to earn new badges.</p>
      </header>

      {loading ? (
        <p className="text-sm text-gray-600">Loading badges…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : badges.length === 0 ? (
        <p className="text-sm text-gray-600">No badges available yet.</p>
      ) : (
        <section className="mx-auto max-w-[800px] space-y-4">
          {badges.map((b, i) => (
            <div
              key={i}
              className="bg-white shadow-sm rounded-2xl p-6 hover:scale-[1.01] hover:shadow-md transition-all duration-200 ease-in-out"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-50 text-indigo-700 grid place-items-center">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900">{b.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 break-words">{b.criteria || b.description}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
