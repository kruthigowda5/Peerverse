"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { uploadSessionVideo } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string; href?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    if (!sessionId || !file) {
      setToast({ type: "error", msg: "Provide both Session ID and a video file." });
      return;
    }
    setLoading(true);
    setToast(null);
    try {
      await uploadSessionVideo(sessionId, file);
      setToast({ type: "success", msg: "Upload successful!", href: `/session/${sessionId}` });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Upload failed";
      setToast({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Upload Session Recording</h1>
      <p className="text-sm text-gray-600 mb-6">Upload a video file for an existing session you created. Only creators or admins can upload.</p>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Session ID</label>
          <input
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="e.g., 8b1c..."
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
            required
          />
        </div>
        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Video"}
        </button>
      </form>

      {toast && (
        <div className={`mt-4 p-3 rounded ${toast.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          <div className="flex items-center justify-between">
            <p>{toast.msg}</p>
            {toast.href && (
              <a href={toast.href} className="underline font-medium">View session</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
