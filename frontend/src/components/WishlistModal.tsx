"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getWishlistMine, removeFromWishlist } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

type WishlistItem = any;

export default function WishlistModal({ open, onOpenChange, onUpdateCount }: { open: boolean; onOpenChange: (v: boolean) => void; onUpdateCount?: (newCount: number) => void }) {
  const [items, setItems] = useState<WishlistItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const w = await getWishlistMine();
        const list = Array.isArray(w) ? w : [];
        setItems(list);
        onUpdateCount?.(list.length);
        if (typeof window !== "undefined") {
          try { localStorage.setItem("wishlistUpdated", Date.now().toString()); } catch {}
        }
      } catch (e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  async function handleRemove(sessionId: string) {
    try {
      await removeFromWishlist(sessionId);
      toast.success("Removed from wishlist ❌");
      // Refresh list
      const w = await getWishlistMine();
      const next = Array.isArray(w) ? w : [];
      setItems(next);
      onUpdateCount?.(next.length);
      if (typeof window !== "undefined") {
        try { localStorage.setItem("wishlistUpdated", Date.now().toString()); } catch {}
      }
      if (!next.length) {
        onOpenChange(false);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || e?.message || "Failed to remove from wishlist.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Wishlist</DialogTitle>
        <DialogDescription>Your wishlisted session videos</DialogDescription>
      </DialogHeader>
      <DialogContent>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !items || items.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">No wishlisted videos yet.</div>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-1">
            <ul className="space-y-3">
              {items.map((it: any, idx: number) => {
                const sessionId = it?.session || it?.session_id || it?.id;
                const title = it?.session_title || it?.title || "Session";
                const mentorName = it?.mentor_name || "Mentor";
                return (
                  <li key={idx} className="p-3 border rounded-lg flex justify-between items-center">
                    <div className="min-w-0 mr-3">
                      {sessionId ? (
                        <Link
                          href={`/session/${sessionId}`}
                          onClick={() => onOpenChange(false)}
                          className="text-base font-semibold text-blue-600 hover:underline truncate block"
                        >
                          {title}
                        </Link>
                      ) : (
                        <p className="text-base font-semibold truncate">{title}</p>
                      )}
                      <p className="text-sm text-gray-500">Mentor: {mentorName}</p>
                    </div>
                    {sessionId && (
                      <Button className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleRemove(String(sessionId))}
                      >
                        Remove
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </DialogContent>
      <DialogFooter>
        <Button onClick={() => onOpenChange(false)}>Close</Button>
      </DialogFooter>
    </Dialog>
  );
}
