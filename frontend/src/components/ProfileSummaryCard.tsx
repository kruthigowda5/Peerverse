"use client";
import { useEffect, useMemo, useState } from "react";
import { getMentorMe } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type MentorMe = {
  avatar_url?: string | null;
  total_hours_taught?: number;
};

export default function ProfileSummaryCard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<MentorMe | null>(null);

  const username = typeof window !== "undefined" ? localStorage.getItem("username") || "" : "";
  const role = typeof window !== "undefined" ? (localStorage.getItem("role") || "").toLowerCase() : "";
  const isMentor = role === "mentor" || role === "sharer" || role === "both";

  useEffect(() => {
    let mounted = true;
    if (!isMentor) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await getMentorMe();
        if (!mounted) return;
        setMe({
          avatar_url: data?.avatar_url || data?.profile_picture || null,
          total_hours_taught: Number(data?.total_hours_taught ?? 0),
        });
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.detail || "Unable to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isMentor]);

  const hours = useMemo(() => Math.max(0, Number(me?.total_hours_taught || 0)), [me]);
  const progressPct = useMemo(() => {
    // Visual only: cap at 100 for bar width
    const target = 100;
    return Math.min(100, Math.round((hours / target) * 100));
  }, [hours]);

  if (!isMentor) return null;

  return (
    <div className="w-full max-w-sm">
      <Card className="shadow-sm border rounded-xl">
        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ) : error ? null : (
            <div className="flex items-center gap-4">
              <img
                src={me?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username || "M")}`}
                alt="Avatar"
                className="h-14 w-14 rounded-full object-cover border"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold truncate">{username || "Mentor"}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">{role || "mentor"}</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm text-gray-600">Total Hours Taught</p>
                    <AnimatedNumber value={hours} />
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <button className="text-xs text-indigo-600 hover:underline" type="button">Edit Profile</button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 600; // ms
    const from = 0;
    const to = value;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setDisplay(Math.round(from + (to - from) * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="text-sm font-medium">{display}</span>;
}
