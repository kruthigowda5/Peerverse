"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSkills, searchSkills, getMentors } from "@/lib/api";

export default function ExplorePage() {
  const router = useRouter();
  const [skills, setSkills] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  // Wishlist UI is provided by the global Navbar's WishlistButton
  const [mentorsCount, setMentorsCount] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState<string>("4.8/5");

  const fetchAll = async () => {
    const s = await getSkills();
    setSkills(Array.isArray(s) ? s : []);
    const m = await getMentors();
    const mCount = Array.isArray(m) ? m.length : 0;
    setMentorsCount(mCount);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "sessionUpdated") {
        fetchAll();
        try { toast.success("🔄 Sessions updated"); } catch {}
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  }, []);


  useEffect(() => {
    const handler = setTimeout(async () => {
      const q = search.trim();
      if (!q) { setSearchResults([]); return; }
      setSearching(true);
      try {
        const r = await searchSkills(q);
        setSearchResults(Array.isArray(r) ? r : []);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const skillsCountText = useMemo(() => `${skills?.length ?? 0}+ Skills`, [skills]);
  const mentorsCountText = useMemo(() => `${mentorsCount ?? 0}+ Mentors`, [mentorsCount]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="container mx-auto px-6">
        <div className="relative max-w-2xl mx-auto mt-6">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for sessions or skills..."
            className="w-full h-10 rounded-full pl-4"
          />
          {search && (
            <div className="absolute mt-2 w-full bg-white rounded-xl shadow border max-h-64 overflow-y-auto">
              {searching ? (
                <div className="p-3 text-sm text-gray-500">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">No results</div>
              ) : (
                <ul className="p-2 space-y-1">
                  {searchResults.map((sk: any) => (
                    <li key={sk.id}>
                      <button
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-50"
                        onClick={() => router.push(`/skills/${sk.id}`)}
                      >
                        {sk.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="pt-8 container mx-auto px-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
          <Card className="bg-white rounded-2xl shadow-md p-6 text-center hover:scale-105 transition-transform">
            <CardContent>
              <p className="text-sm text-gray-500">Skills Count</p>
              <p className="text-2xl font-semibold">{skillsCountText}</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-2xl shadow-md p-6 text-center hover:scale-105 transition-transform">
            <CardContent>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-semibold">{avgRating}</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-2xl shadow-md p-6 text-center hover:scale-105 transition-transform">
            <CardContent>
              <p className="text-sm text-gray-500">Mentors Count</p>
              <p className="text-2xl font-semibold">{mentorsCountText}</p>
            </CardContent>
          </Card>
        </section>

        <section className="my-6">
          <h2 className="text-lg font-semibold mb-4">Skills</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((sk: any) => (
              <Link key={sk.id} href={`/skills/${sk.id}`} className="block">
                <Card className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{sk.name}</p>
                        {sk.category && <p className="text-xs text-gray-500">{sk.category}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="border rounded-lg p-4 max-w-3xl mx-auto my-10 bg-white">
          <details className="border-b py-3">
            <summary className="cursor-pointer font-semibold text-lg">What is Peerverse?</summary>
            <p className="text-gray-600 mt-2">Peerverse is a peer-led learning platform that helps you earn SkillPoints and discover new skills.</p>
          </details>
          <details className="border-b py-3">
            <summary className="cursor-pointer font-semibold text-lg">How do I earn SkillPoints?</summary>
            <p className="text-gray-600 mt-2">You earn points by hosting or completing learning sessions.</p>
          </details>
          <details className="border-b py-3">
            <summary className="cursor-pointer font-semibold text-lg">How do I become a mentor?</summary>
            <p className="text-gray-600 mt-2">You can apply to become a mentor from your dashboard.</p>
          </details>
          <details className="py-3">
            <summary className="cursor-pointer font-semibold text-lg">Can I watch sessions later?</summary>
            <p className="text-gray-600 mt-2">Yes, you can revisit recorded sessions anytime.</p>
          </details>
        </section>
      </main>
    </div>
  );
}
