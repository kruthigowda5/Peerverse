"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { isAuthenticated, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import MentorDashboard from "@/components/MentorDashboard";
import LearnerDashboard from "@/components/LearnerDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard/");
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    fetchDashboard();
  }, [router]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "sessionUpdated") {
        fetchDashboard();
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

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-gray-600">Loading dashboard...</div>;
  }
  if (error) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="bg-white p-6 rounded-xl shadow max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.replace("/login")} className="px-4 py-2 bg-indigo-600 text-white rounded">Go to Login</button>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const isMentor = String(data.role).toLowerCase() === "sharer" || String(data.role).toLowerCase() === "mentor" || String(data.role).toLowerCase() === "both";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Peerverse Dashboard</h1>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900">Home</a>
            <button onClick={logout} className="px-3 py-1.5 bg-gray-900 text-white rounded text-sm">Logout</button>
          </div>
        </div>
      </header>

      {isMentor ? <MentorDashboard data={data} /> : <LearnerDashboard data={data} />}
    </div>
  );
}
