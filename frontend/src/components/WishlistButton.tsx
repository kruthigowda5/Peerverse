"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getWishlistMine } from "@/lib/api";
import WishlistModal from "@/components/WishlistModal";
import { Heart } from "lucide-react";

export default function WishlistButton() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  // Initial fetch (only when authenticated)
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
    if (!token) return;
    (async () => {
      try {
        const w = await getWishlistMine();
        setCount(Array.isArray(w) ? w.length : 0);
      } catch {
        setCount(0);
      }
    })();
  }, []);

  // Listen for cross-tab/page updates
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "wishlistUpdated") return;
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      if (!token) return;
      (async () => {
        try {
          const w = await getWishlistMine();
          setCount(Array.isArray(w) ? w.length : 0);
        } catch {
          setCount(0);
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
  }, []);

  return (
    <>
      <div className="relative ml-2">
        <Button
          className="relative flex items-center justify-center p-2 rounded-full bg-white text-gray-900 border hover:bg-gray-50 transition-transform duration-150 ease-out hover:scale-110 shadow-sm hover:shadow-md"
          aria-label="Open wishlist"
          title="Wishlist"
          onClick={() => setOpen(true)}
        >
          <Heart size={28} strokeWidth={2.2} className="text-gray-600" />
          {count > 0 ? (
            <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none min-w-[16px] h-[16px] flex items-center justify-center">
              {count}
            </span>
          ) : null}
        </Button>
      </div>
      <WishlistModal open={open} onOpenChange={setOpen} onUpdateCount={(n) => setCount(n)} />
    </>
  );
}
