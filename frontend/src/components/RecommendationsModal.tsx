"use client";

import { X, ExternalLink } from "lucide-react";
import { useEffect } from "react";

export type Video = { id: string; title: string; description: string; url: string };

export default function RecommendationsModal({
  open,
  onClose,
  loading,
  error,
  videos,
  skills,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  videos: Video[];
  skills: string[];
}) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} style={{ transition: "opacity 150ms ease" }}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border overflow-hidden">
          <div className="h-12 px-4 flex items-center justify-between border-b bg-[#F3F0FF]">
            <div className="text-sm font-semibold">AI Recommendations</div>
            <button className="p-1 rounded hover:bg-white/60" onClick={onClose} aria-label="Close">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {skills?.length ? (
              <div className="text-xs text-gray-500 mb-3">Skills: {skills.join(", ")}</div>
            ) : null}
            {loading && <div className="text-sm text-gray-600">Loading recommendations...</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            {!loading && !error && Array.isArray(videos) && videos.length === 0 && (
              <div className="text-sm text-gray-600">No recommendations, make sure you have skills in your "to learn" section.</div>
            )}
            {!loading && !error && videos?.length > 0 && (
              <ul className="space-y-3">
                {videos.map((v) => (
                  <li key={v.id} className="p-3 rounded-lg border hover:shadow-sm transition-shadow">
                    <div className="font-medium text-gray-900">{v.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{v.description}</div>
                    <a className="inline-flex items-center gap-1 text-indigo-600 text-sm mt-2 hover:underline" href={v.url} target="_blank" rel="noreferrer">
                      Watch <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
