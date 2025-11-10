"use client";
import Link from "next/link";
import { isAuthenticated, logout } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import WishlistButton from "@/components/WishlistButton";
import { useRouter } from "next/navigation";
import { getMentorMe } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, Heart, Settings, Mail, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(isAuthenticated()); }, []);

  return (
    <nav className="h-16 bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center hover:scale-105 transition-transform">
          <span className="text-2xl font-semibold tracking-tight text-gray-900">Peerverse</span>
        </Link>
        <div className="flex items-center gap-6 text-sm flex-1 justify-end">
          <Link href="/" className="hover:text-gray-900 text-gray-600">Home</Link>
          <Link href="/sessions" className="hover:text-gray-900 text-gray-600">Sessions</Link>
          <Link href="/dashboard" className="hover:text-gray-900 text-gray-600">Dashboard</Link>
          <div className="hidden md:block">
            <SearchInput />
          </div>
          <WishlistButton />
          {authed ? (
            <AvatarDropdown />
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 bg-gray-900 text-white rounded">Login</Link>
              <Link href="/register" className="px-3 py-1.5 bg-indigo-600 text-white rounded">Join Now</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function AvatarDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [theme, setTheme] = useState<string>("light");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const u = typeof window !== "undefined" ? localStorage.getItem("username") || "" : "";
    const r = typeof window !== "undefined" ? (localStorage.getItem("role") || "") : "";
    setUsername(u);
    setRole(r);
    // Try to load avatar if mentor
    (async () => {
      try {
        const rr = (r || "").toLowerCase();
        if (rr === "mentor" || rr === "sharer" || rr === "both") {
          const me = await getMentorMe();
          const url = me?.avatar_url || me?.profile_picture || null;
          if (url) setAvatarUrl(String(url));
        }
      } catch {}
    })();
  }, []);

  // Theme init from storage
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const initial = stored || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    if (initial === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try { localStorage.setItem('theme', next); } catch {}
  }

  // Build two-letter initials; handle underscores/dots/hyphens
  const initials = (() => {
    const cleaned = (username || '').replace(/[^A-Za-z0-9]+/g, ' ').trim();
    if (!cleaned) return 'U';
    const parts = cleaned.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    // single token: take first two letters
    return parts[0].slice(0, 2).toUpperCase();
  })();

  return (
    <div className="relative" ref={ref} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setOpen(true)}
        className="h-9 w-9 rounded-full border bg-white overflow-hidden grid place-items-center shadow-sm hover:shadow-md hover:scale-105 transition"
        aria-label="User menu"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-xs font-semibold bg-purple-600 text-white">
            {initials}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white shadow-md py-1 z-50" onMouseEnter={() => setOpen(true)}>
          <div className="px-3 py-2 border-b">
            <p className="text-sm font-medium truncate">{username || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{role || 'member'}</p>
          </div>
          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm" onClick={() => router.push('/profile')}>
            <Settings size={16} /> Edit Profile
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm" onClick={() => setContactOpen(true)}>
            <Mail size={16} /> Edit Email/Contact
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm" onClick={() => router.push('/wishlist')}>
            <Heart size={16} /> My Wishlist
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
          <div className="my-1 border-t" />
          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-red-600" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogHeader>
          <DialogTitle>Edit Email/Contact</DialogTitle>
          <DialogDescription>Update your email or contact information.</DialogDescription>
        </DialogHeader>
        <DialogContent>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setContactOpen(false); }}>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" className="w-full border rounded px-3 py-2" placeholder="you@example.com" defaultValue={""} />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input type="tel" className="w-full border rounded px-3 py-2" placeholder="+91 98765 43210" defaultValue={""} />
            </div>
          </form>
        </DialogContent>
        <DialogFooter>
          <Button onClick={() => setContactOpen(false)}>Close</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
