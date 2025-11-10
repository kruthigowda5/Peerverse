"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ChatbotModal from "@/components/ChatbotModal";
import RecommendationsModal, { type Video } from "@/components/RecommendationsModal";

async function fetchUserProfile(): Promise<{ role: string; skills_to_learn?: string[] } | null> {
  try {
    const res = await fetch("/api/user/profile/", { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function getLocalUser(): { role: string | null; skills_to_learn?: string[] } {
  try {
    if (typeof window === "undefined") return { role: null };
    const role = localStorage.getItem("role");
    const skillsRaw = localStorage.getItem("skills_to_learn");
    const skills = skillsRaw ? JSON.parse(skillsRaw) : undefined;
    return { role: role ? role.toLowerCase() : null, skills_to_learn: skills };
  } catch {
    return { role: null };
  }
}

function cacheKey(skills: string[]) {
  // New namespace to avoid stale caches from older YouTube-based results
  return `rec_sessions:${skills.map((s) => s.toLowerCase()).sort().join(",")}`;
}

export default function AIRecommendationsBox() {
  const [mentorOpen, setMentorOpen] = useState(false);
  const [learnerOpen, setLearnerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  const icon = useMemo(
    () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    []
  );

  const handleClick = useCallback(async () => {
    // 1) Prefer backend profile → fallback to localStorage to avoid stale skills
    const profile = await fetchUserProfile();
    let role = profile?.role?.toLowerCase?.() ?? null;
    // Normalize profile skills (can be string or array or array of objects)
    const normalizeSkills = (val: any): string[] => {
      if (!val) return [];
      if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
      if (Array.isArray(val)) {
        return val
          .map((x) => {
            if (typeof x === "string") return x;
            if (x && typeof x === "object") {
              const cand = x.name || x.skill || x.title || x.tag;
              return typeof cand === "string" ? cand : "";
            }
            return "";
          })
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    };

    const profileSkills = normalizeSkills(profile?.skills_to_learn);
    const { role: lsRole, skills_to_learn: lsSkills } = getLocalUser();
    const lsNorm = normalizeSkills(lsSkills);
    if (!role) role = lsRole;
    const chosenSkills = (profileSkills && profileSkills.length ? profileSkills : lsNorm) || [];
    const chosenSource = profileSkills && profileSkills.length ? "profile" : "localStorage";
    console.log("[AIRec] chosen skills source:", chosenSource, chosenSkills);
    // Keep localStorage in sync when profile provides skills
    try {
      if (chosenSource === "profile" && typeof window !== "undefined") {
        localStorage.setItem("skills_to_learn", JSON.stringify(chosenSkills));
      }
    } catch {}

    // 2) Mentor path: open chatbot
    if (role === "mentor") {
      setMentorOpen(true);
      return;
    }

    // 3) Learner path
    const targetSkills = Array.isArray(chosenSkills) ? chosenSkills.filter(Boolean) : [];
    setSkills(targetSkills);
    setLearnerOpen(true);
    setError(null);
    setVideos([]);

    // If no skills, just show empty state
    if (!targetSkills.length) return;

    try {
      setLoading(true);

      // 4) Always fetch fresh to avoid stale recommendations while debugging
      const skillsStr = targetSkills.map((s) => s.toLowerCase()).sort().join(",");
      if (typeof window !== "undefined") {
        localStorage.setItem("rec_sessions_last_skills", skillsStr);
      }

      // 5) Build a comma-separated skills param, no spaces, then encode
      const skillsParam = skillsStr;
      const url = `/api/recommendations/?skills_to_learn=${encodeURIComponent(skillsParam)}`;
      console.log("[AIRec] Fetching:", url, "with skills:", skillsStr);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      const data = (await res.json()) as { videos: Video[] };
      setVideos(data.videos || []);
      // store cache
      if (typeof window !== "undefined") {
        localStorage.setItem(cacheKey(targetSkills), JSON.stringify(data.videos || []));
      }
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <Card className="hover:shadow-md hover:scale-[1.02] transition-transform cursor-pointer" onClick={handleClick}>
        <CardContent className="p-6">
          <div className="h-10 w-10 rounded-md bg-indigo-50 text-indigo-700 grid place-items-center">{icon}</div>
          <h3 className="mt-4 font-semibold text-gray-900">AI Recommendations</h3>
          <p className="mt-1 text-sm text-gray-600">Personalized mentor and skill matching.</p>
        </CardContent>
      </Card>

      <ChatbotModal open={mentorOpen} onClose={() => setMentorOpen(false)} />

      <RecommendationsModal
        open={learnerOpen}
        onClose={() => setLearnerOpen(false)}
        loading={loading}
        error={error}
        videos={videos}
        skills={skills}
      />
    </>
  );
}
