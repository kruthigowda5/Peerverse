"use client";
import { useEffect, useState } from "react";
import { login as loginApi } from "@/lib/api";
import { setTokens, isAuthenticated } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  useEffect(() => {
    let mounted = true;
    if (mounted && isAuthenticated() && pathname !== "/dashboard") {
      router.replace("/dashboard");
    }
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await loginApi(username, password);
      setTokens(res.access, res.refresh);
      try {
        if (res.user) {
          if (res.user.username) localStorage.setItem("username", res.user.username);
          if (res.user.role) localStorage.setItem("role", res.user.role);
        } else {
          console.warn("No user data returned in login response:", res);
        }
      } catch {}
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-6 text-center">Peerverse Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input value={username} onChange={(e)=>setUsername(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-sm text-center mt-4">No account? <a href="/register" className="text-indigo-600">Register</a></p>
      </div>
    </div>
  );
}
