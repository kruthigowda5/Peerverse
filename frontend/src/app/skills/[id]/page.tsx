"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addToWishlist, getSessionsBySkill } from "@/lib/api";
import toast from "react-hot-toast";

export default function SkillDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = String(params?.id || "");
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!skillId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await getSessionsBySkill(skillId);
        setSessions(Array.isArray(list) ? list : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    })();
  }, [skillId]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <button className="text-indigo-600 font-semibold" onClick={() => router.push("/explore")}>← Explore</button>
          <div className="font-semibold">Skill Sessions</div>
          <div />
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        {loading ? (
          <p className="text-sm text-gray-500">Loading sessions...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-500">No sessions available for this skill.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((s: any) => (
              <Card key={s.id} className="bg-white rounded-2xl shadow-md">
                <CardContent className="p-5 space-y-2">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-gray-500">Mentor: {typeof s.created_by === 'object' ? (s.created_by.username || s.created_by.email || '—') : '—'}</p>
                  {typeof s.rating === 'number' && (
                    <p className="text-sm text-gray-500">Rating: {s.rating.toFixed(1)}/5</p>
                  )}
                  {s.duration && (
                    <p className="text-sm text-gray-500">Duration: {s.duration}</p>
                  )}
                  <div className="pt-2 flex items-center gap-2">
                    <Button onClick={() => router.push(`/session/${s.id}`)}>Open</Button>
                    <Button className="bg-white text-gray-900 border hover:bg-gray-50" onClick={async () => {
                      try {
                        await addToWishlist({ session_id: s.id });
                        toast.success("Added to wishlist ❤️");
                        try { localStorage.setItem("wishlistUpdated", Date.now().toString()); } catch {}
                      } catch (e: any) {
                        const detail = e?.response?.data?.detail || e?.message || "Failed to add to wishlist.";
                        if (typeof detail === 'string' && /already|exists/i.test(detail)) {
                          toast("Already in wishlist.");
                        } else {
                          toast.error("Failed to add to wishlist.");
                        }
                      }
                    }}>Add to Wishlist</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
