"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getWishlistMine, removeFromWishlist } from "@/lib/api";

export default function WishlistPage() {
  const [items, setItems] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const w = await getWishlistMine();
        setItems(Array.isArray(w) ? w : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleRemove(sessionId: string) {
    try {
      await removeFromWishlist(sessionId);
      const w = await getWishlistMine();
      setItems(Array.isArray(w) ? w : []);
      if (typeof window !== "undefined") {
        try { localStorage.setItem("wishlistUpdated", Date.now().toString()); } catch {}
      }
    } catch {}
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900">My Wishlist</h1>
      <p className="text-sm text-gray-600">Your saved session videos.</p>
      <Card className="mt-6">
        <CardContent className="p-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : !items || items.length === 0 ? (
            <div className="py-6 text-sm text-gray-500">No wishlisted videos yet.</div>
          ) : (
            <ul className="space-y-3">
              {items.map((it: any, idx: number) => {
                const sessionId = it?.session || it?.session_id || it?.id;
                const title = it?.session_title || it?.title || "Session";
                const mentorName = it?.mentor_name || "Mentor";
                return (
                  <li key={idx} className="p-3 border rounded-lg flex justify-between items-center">
                    <div className="min-w-0 mr-3">
                      {sessionId ? (
                        <Link href={`/session/${sessionId}`} className="text-base font-semibold text-blue-600 hover:underline truncate block">
                          {title}
                        </Link>
                      ) : (
                        <p className="text-base font-semibold truncate">{title}</p>
                      )}
                      <p className="text-sm text-gray-500">Mentor: {mentorName}</p>
                    </div>
                    {sessionId && (
                      <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleRemove(String(sessionId))}>
                        Remove
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
