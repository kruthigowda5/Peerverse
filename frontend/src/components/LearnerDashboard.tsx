"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COLORS = ["#6366F1", "#22D3EE", "#F59E0B", "#EF4444", "#10B981"];

export default function LearnerDashboard({ data }: { data: any }) {
  const router = useRouter();
  const hours = data?.stats?.weekly_learning_hours || [];
  const [openBadge, setOpenBadge] = useState<any | null>(null);

  const badgeDescriptions = useMemo(() => new Map<string, string>(), []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500">SkillPoints</p>
          <p className="text-2xl font-semibold">{data.points}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500">Badges</p>
          <p className="text-2xl font-semibold">{data.badges.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500">Sessions Created</p>
          <p className="text-2xl font-semibold">{data.sessions_created}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500">Sessions Joined</p>
          <p className="text-2xl font-semibold">{data.sessions_joined}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-4 shadow lg:col-span-2">
          <h2 className="font-medium mb-2">Weekly Learning Hours</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hours}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area isAnimationActive animationDuration={800} type="monotone" dataKey="hours" stroke="#6366F1" fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-medium mb-2">Top Skills</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.stats.top_skills} dataKey="value" nameKey="skill" outerRadius={90}>
                  {data.stats.top_skills.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-medium mb-2">Your Badges</h2>
          <div className="flex flex-wrap gap-2">
            {data.badges.length === 0 && <p className="text-gray-500 text-sm">No badges yet.</p>}
            {data.badges.map((b: any) => (
              <button key={b.id} onClick={() => setOpenBadge(b)} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm hover:bg-indigo-100">{b.name}</button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-medium mb-2">Skills</h2>
          <p className="text-sm text-gray-500">Known</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {data.skills_known.length === 0 && <span className="text-gray-400 text-sm">None</span>}
            {data.skills_known.map((s: string, i: number) => (
              <span key={i} className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-sm">{s}</span>
            ))}
          </div>
          <p className="text-sm text-gray-500">To Learn</p>
          <div className="flex flex-wrap gap-2">
            {data.skills_to_learn.length === 0 && <span className="text-gray-400 text-sm">None</span>}
            {data.skills_to_learn.map((s: string, i: number) => (
              <Button key={i} className="h-7 px-3 text-xs" onClick={() => router.push(`/mentors?skill=${encodeURIComponent(s)}`)}>{s}</Button>
            ))}
          </div>
        </div>
      </section>

      {/* Badge Dialog */}
      <Dialog open={!!openBadge} onOpenChange={(o) => !o && setOpenBadge(null)}>
        <DialogHeader>
          <DialogTitle>{openBadge?.name}</DialogTitle>
          <DialogDescription>Badge details</DialogDescription>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-gray-700">{badgeDescriptions.get(openBadge?.name) || "You earned this badge for your learning progress on Peerverse."}</p>
          {openBadge?.created_at && (
            <p className="text-xs text-gray-500">Earned on {new Date(openBadge.created_at).toLocaleString()}</p>
          )}
        </DialogContent>
        <DialogFooter>
          <Button onClick={() => setOpenBadge(null)}>Close</Button>
        </DialogFooter>
      </Dialog>
    </main>
  );
}
