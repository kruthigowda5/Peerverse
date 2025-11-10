"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSessionById, type Session, getWishlistMine, addToWishlist, removeFromWishlist, deleteSession } from "@/lib/api";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
import { getUserIdFromAccess } from "@/lib/jwt";

export default function SessionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  function itemMatchesSession(item: any, sessionId: string): boolean {
    if (!item || !sessionId) return false;

    const normalizedId = String(sessionId).trim().replace(/^\/+|\/+$/g, "");

    const fromSessionObject =
      typeof item.session === "object" && item.session !== null
        ? item.session.id || item.session.session_id
        : item.session;

    const candidates = [item.session_id, fromSessionObject, item.id].map((v) =>
      v != null ? String(v).trim().replace(/^\/+|\/+$/g, "") : ""
    );

    return candidates.includes(normalizedId);
  }

  useEffect(() => {
    if (!id) return;
    (async () => {
      const data = await getSessionById(id);
      setSession(data);
      setLoading(false);
      // determine ownership + role
      try {
        const uid = getUserIdFromAccess();
        const ownerId = typeof data?.created_by === 'string' ? data?.created_by : (data?.created_by as any)?.id;
        const role = typeof window !== 'undefined' ? (localStorage.getItem('role') || '').toLowerCase() : '';
        const storedUsername = typeof window !== 'undefined' ? (localStorage.getItem('username') || '').toLowerCase() : '';
        const ownerUsernameFromObj = typeof data?.created_by === 'object' && data?.created_by ? (data?.created_by as any)?.username : undefined;
        const ownerUsername = ((data as any)?.created_by_username || ownerUsernameFromObj || '').toString().toLowerCase();
        const isOwnerById = uid && ownerId && String(uid) === String(ownerId);
        const isOwnerByUsername = storedUsername && ownerUsername && storedUsername === ownerUsername;
        const isOwner = Boolean(isOwnerById || isOwnerByUsername);
        const isMentor = role === 'mentor' || role === 'sharer' || role === 'both';
        setCanDelete(Boolean(isOwner && isMentor));
      } catch {
        setCanDelete(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const list = await getWishlistMine();
        const found = Array.isArray(list) && list.some((it: any) => itemMatchesSession(it, id));
        setIsWishlisted(Boolean(found));
      } catch (err) {
        console.error("Wishlist fetch failed", err);
        setIsWishlisted(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "wishlistUpdated") return;
      (async () => {
        try {
          const list = await getWishlistMine();
          const found = Array.isArray(list) && list.some((it: any) => itemMatchesSession(it, id));
          setIsWishlisted(Boolean(found));
        } catch (err) {
          console.error("Wishlist fetch failed", err);
        }
      })();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10">Loading...</div>;
  if (!session) return <div className="max-w-4xl mx-auto px-4 py-10">Session not found.</div>;

  const skillName = typeof session.skill === 'string' ? session.skill : session.skill?.name;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
      <h1 className="text-3xl font-bold">{session.title}</h1>
      <p className="text-gray-600">{session.description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500">Skill</p>
          <p className="font-medium">{skillName}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500">Time</p>
          <p className="font-medium">{new Date(session.start_time).toLocaleString()} – {new Date(session.end_time).toLocaleString()}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow">
        <p className="text-sm text-gray-500">Meeting Link</p>
        <a href={session.meeting_link} target="_blank" className="text-indigo-600 underline break-all">{session.meeting_link}</a>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Button
          className={`bg-white text-gray-900 border hover:bg-gray-50 h-9 px-3 rounded-full flex items-center transition-all hover:scale-105`}
          onClick={async () => {
            try {
              if (!isWishlisted) {
                await addToWishlist({ session_id: id });
                setIsWishlisted(true);
                toast.success("Added to wishlist ❤️");
              } else {
                await removeFromWishlist(id);
                setIsWishlisted(false);
                toast.success("Removed from wishlist ❌");
              }
              try { localStorage.setItem("wishlistUpdated", Date.now().toString()); } catch {}
            } catch (e: any) {
              const detail = e?.response?.data?.detail || e?.message || "Wishlist action failed.";
              if (!isWishlisted && typeof detail === 'string' && /already|exists/i.test(detail)) {
                toast("Already in wishlist.");
                setIsWishlisted(true);
              } else {
                toast.error("Failed to update wishlist.");
              }
            }
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"} w-4 h-4 mr-2`} />
          {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        </Button>
        {canDelete && (
          <Button
            className="h-9 px-3 rounded-full border border-red-300 text-red-600 bg-red-50 hover:bg-red-100"
            onClick={async () => {
              const ok = typeof window !== 'undefined' ? window.confirm("Are you sure you want to delete this session? This action cannot be undone.") : false;
              if (!ok) return;
              try {
                await deleteSession(id);
                toast.success("✅ Session deleted successfully.");
                try { localStorage.setItem("sessionUpdated", Date.now().toString()); } catch {}
                router.push('/sessions');
              } catch (e: any) {
                const status = e?.response?.status;
                if (status === 403 || status === 401) {
                  toast.error("⚠️ You don’t have permission to delete this session.");
                } else {
                  toast.error("❌ Failed to delete session.");
                }
              }
            }}
          >
            🗑️ Delete Session
          </Button>
        )}
      </div>
      {session.is_recorded && session.recording_url && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-medium mb-2">Recording</p>
          <video controls className="w-full rounded">
            <source src={session.recording_url} />
          </video>
        </div>
      )}
    </div>
  );
}
