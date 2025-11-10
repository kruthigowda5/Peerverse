"use client";
import { useEffect, useState } from "react";
import { api, getCertificatesPaged, getMySessions, getSessionParticipants, uploadVideo } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type ActiveSection = null | "points" | "sessions" | "badges" | "mentees";

const SessionsDetails = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await getMySessions(1, 50);
        setSessions(Array.isArray(res) ? res : (res.results || []));
      } catch {
        setSessions([]);
      }
    })();
  }, []);
  if (!sessions.length) return <p className="text-sm text-gray-500">No sessions created yet.</p>;
  return (
    <div className="space-y-3">
      {sessions.map((session: any) => (
        <div key={session.id} className="p-3 border rounded-lg hover:bg-gray-50">
          <h4 className="font-medium">{session.title}</h4>
          <p className="text-sm text-gray-500">Created: {new Date(session.created_at || session.start_time).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

const BadgesDetails = () => {
  const [badges, setBadges] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/badges/mine/");
        const data = r.data;
        setBadges(Array.isArray(data) ? data : (data.results || []));
      } catch {
        setBadges([]);
      }
    })();
  }, []);
  if (!badges.length) return <p className="text-sm text-gray-500">No badges earned yet.</p>;
  return (
    <div className="space-y-3">
      {badges.map((b: any) => (
        <div key={b.id} className="p-3 border rounded-lg hover:bg-gray-50">
          <h4 className="font-medium">{b.name}</h4>
          {b.description && <p className="text-sm text-gray-500">{b.description}</p>}
        </div>
      ))}
    </div>
  );
};

const MenteesDetails = () => {
  const [mentees, setMentees] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/mentees/mine/");
        const data = r.data;
        setMentees(Array.isArray(data) ? data : (data.results || []));
      } catch {
        setMentees([]);
      }
    })();
  }, []);
  if (!mentees.length) return <p className="text-sm text-gray-500">No mentees found.</p>;
  return (
    <div className="space-y-3">
      {mentees.map((u: any) => (
        <div key={u.id} className="p-3 border rounded-lg hover:bg-gray-50">
          <h4 className="font-medium">{u.username || u.first_name || "User"}</h4>
          <p className="text-sm text-gray-500">{u.email || "N/A"}</p>
        </div>
      ))}
    </div>
  );
};

const SkillPointsDetails = ({ total }: { total: number }) => {
  return (
    <div className="space-y-3">
      <div className="p-3 border rounded-lg">
        <h4 className="font-medium">Total Points</h4>
        <p className="text-sm text-gray-500">{total}</p>
      </div>
      <p className="text-xs text-gray-500">Breakdown not available.</p>
    </div>
  );
};

export default function MentorDashboard({ data }: { data: any }) {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [certPage, setCertPage] = useState(1);
  const [certPageSize] = useState(6);
  const [certCount, setCertCount] = useState(0);

  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessPage, setSessPage] = useState(1);
  const [sessPageSize] = useState(6);
  const [sessCount, setSessCount] = useState(0);
  const [viewCert, setViewCert] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsSession, setParticipantsSession] = useState<any | null>(null);

  // Upload modal state
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [uploading, setUploading] = useState(false);

  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = (section: ActiveSection) => {
    setActiveSection(section);
    setDrawerOpen(true);
  };

  useEffect(() => {
    (async () => {
      // Certificates paginated
      try {
        setLoadingCerts(true);
        const res = await getCertificatesPaged(certPage, certPageSize);
        if (Array.isArray(res)) {
          // in case backend returned list directly
          setCertificates(res);
          setCertCount(res.length);
        } else {
          setCertificates(res.results || []);
          setCertCount(res.count || 0);
        }
      } finally {
        setLoadingCerts(false);
      }
      // My sessions paginated
      try {
        setLoadingSessions(true);
        const res2 = await getMySessions(sessPage, sessPageSize);
        if (Array.isArray(res2)) {
          setSessions(res2);
          setSessCount(res2.length);
        } else {
          setSessions(res2.results || []);
          setSessCount(res2.count || 0);
        }
      } finally {
        setLoadingSessions(false);
      }
    })();
  }, [certPage, certPageSize, sessPage, sessPageSize]);

  const handleUpload = async () => {
    if (!file) {
      toast({ variant: "destructive", title: "No file", description: "Please choose a video file." });
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      if (sessionId) form.append("session_id", sessionId);
      form.append("title", title);
      form.append("description", description);
      form.append("video", file);
      await uploadVideo(form);
      toast({ title: "Upload complete", description: "Your video was uploaded successfully." });
      setOpen(false);
      setTitle(""); setDescription(""); setFile(null); setSessionId("");
      // refresh certificates after upload (some backends issue certificates after upload)
      setCertPage(1);
      setLoadingCerts(true);
      const res = await getCertificatesPaged(1, certPageSize);
      if (Array.isArray(res)) { setCertificates(res); setCertCount(res.length); }
      else { setCertificates(res.results || []); setCertCount(res.count || 0); }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Upload failed", description: e?.response?.data?.detail || e?.message || "Something went wrong" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cursor-pointer hover:bg-gray-100 transition rounded-xl" onClick={() => openDrawer("points")}> 
          <Card className="shadow-sm border">
            <CardContent>
              <p className="text-sm text-gray-500">SkillPoints</p>
              <p className="text-2xl font-semibold">{data.points}</p>
            </CardContent>
          </Card>
        </div>
        <div className="cursor-pointer hover:bg-gray-100 transition rounded-xl" onClick={() => openDrawer("sessions")}>
          <Card className="shadow-sm border">
            <CardContent>
              <p className="text-sm text-gray-500">Sessions Created</p>
              <p className="text-2xl font-semibold">{data.sessions_created}</p>
            </CardContent>
          </Card>
        </div>
        <div className="cursor-pointer hover:bg-gray-100 transition rounded-xl" onClick={() => openDrawer("badges")}>
          <Card className="shadow-sm border">
            <CardContent>
              <p className="text-sm text-gray-500">Badges</p>
              <p className="text-2xl font-semibold">{data.badges?.length || 0}</p>
            </CardContent>
          </Card>
        </div>
        <div className="cursor-pointer hover:bg-gray-100 transition rounded-xl" onClick={() => openDrawer("mentees")}>
          <Card className="shadow-sm border">
            <CardContent>
              <p className="text-sm text-gray-500">Total Mentees</p>
              <p className="text-2xl font-semibold">{data.total_mentees || 0}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="max-w-md w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {activeSection === "points" && "Skill Points"}
              {activeSection === "sessions" && "Sessions Created"}
              {activeSection === "badges" && "Badges Earned"}
              {activeSection === "mentees" && "Your Mentees"}
            </SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4">
            {activeSection === "points" && <SkillPointsDetails total={data.points} />}
            {activeSection === "sessions" && <SessionsDetails />}
            {activeSection === "badges" && <BadgesDetails />}
            {activeSection === "mentees" && <MenteesDetails />}
          </div>
        </SheetContent>
      </Sheet>

      {/* Upload / Manage Videos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Session Videos</h2>
              <p className="text-sm text-gray-500">Add or upload recorded mentoring sessions.</p>
            </div>
            <Button onClick={() => setOpen(true)}>{uploading ? (<><Spinner className="h-4 w-4 mr-2" /> Uploading...</>) : "Upload Video"}</Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 italic">Manage your session recordings here.</p>
        </CardContent>
      </Card>

      {/* Certificates */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Certificates Issued</h2>
        </CardHeader>
        <CardContent>
          {loadingCerts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: certPageSize }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.length === 0 ? (
                  <p className="text-gray-400 italic">No certificates earned yet.</p>
                ) : (
                  certificates.map((c: any) => (
                    <Card key={c.id} className="border hover:shadow-sm transition">
                      <CardContent>
                        <p className="font-medium">{c.certificate_id || c.title || "Certificate"}</p>
                        {c.created_at && (
                          <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</p>
                        )}
                        <div className="mt-2">
                          <Button className="h-8 px-3" onClick={() => setViewCert(c)}>View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              <Pagination className="mt-4 justify-end" page={certPage} total={certCount} pageSize={certPageSize} onPageChange={setCertPage} />
            </>
          )}
        </CardContent>
      </Card>

      {/* My Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">My Sessions</h2>
            <Input placeholder="Search by title or skill..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: sessPageSize }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.length === 0 ? (
                  <p className="text-gray-400 italic">You haven't created any sessions yet.</p>
                ) : (
                  sessions
                    .filter((s: any) => {
                      const term = search.trim().toLowerCase();
                      if (!term) return true;
                      const title = String(s.title || '').toLowerCase();
                      const skill = typeof s.skill === 'string' ? s.skill : (s.skill?.name || '');
                      return title.includes(term) || String(skill).toLowerCase().includes(term);
                    })
                    .map((s: any) => (
                    <Card key={s.id} className="border hover:shadow-sm transition">
                      <CardContent>
                        <p className="font-medium">{s.title}</p>
                        <div className="text-xs text-gray-500">
                          <p>Skill: {typeof s.skill === 'string' ? s.skill : (s.skill?.name || '-')}</p>
                          <p>Last Updated: {new Date(s.end_time || s.start_time).toLocaleString()}</p>
                        </div>
                        {typeof s.participants_count === 'number' && (
                          <p className="text-xs text-gray-500 mt-1">Participants: {s.participants_count}</p>
                        )}
                        <div className="mt-2 flex items-center gap-3">
                          <a href={`/session/${s.id}`} className="text-indigo-600 underline text-sm">Manage</a>
                          <button
                            className="text-sm text-gray-700 hover:underline"
                            onClick={async () => {
                              setParticipantsOpen(true);
                              setParticipantsSession(s);
                              setParticipantsLoading(true);
                              try {
                                const list = await getSessionParticipants(s.id);
                                setParticipants(Array.isArray(list) ? list : (list.results || []));
                              } finally {
                                setParticipantsLoading(false);
                              }
                            }}
                          >
                            View Participants
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              <Pagination className="mt-4 justify-end" page={sessPage} total={sessCount} pageSize={sessPageSize} onPageChange={setSessPage} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Upload Session Video</DialogTitle>
          <DialogDescription>Provide details and upload an MP4 recording. Optionally link to a Session ID.</DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="grid gap-3 opacity-100">
            <div>
              <label className="block text-sm mb-1">Session ID (optional)</label>
              <Input placeholder="8b1c-..." value={sessionId} onChange={(e) => setSessionId(e.target.value)} disabled={uploading} />
            </div>
            <div>
              <label className="block text-sm mb-1">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required disabled={uploading} />
            </div>
            <div>
              <label className="block text-sm mb-1">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={uploading} />
            </div>
            <div>
              <label className="block text-sm mb-1">Video File</label>
              <Input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={uploading} />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} className="bg-gray-200 text-gray-900 hover:bg-gray-300" disabled={uploading}>Cancel</Button>
          <Button onClick={handleUpload} disabled={uploading}>{uploading ? (<><Spinner className="h-4 w-4 mr-2" /> Uploading...</>) : "Upload"}</Button>
        </DialogFooter>
      </Dialog>

      {/* Certificate View Modal */}
      <Dialog open={!!viewCert} onOpenChange={(o) => !o && setViewCert(null)}>
        <DialogHeader>
          <DialogTitle>Certificate Preview</DialogTitle>
        </DialogHeader>
        <DialogContent>
          {viewCert?.qr_code_url ? (
            <img src={viewCert.qr_code_url} alt="Certificate" className="w-full rounded" />
          ) : viewCert?.pdf_url ? (
            <a href={viewCert.pdf_url} target="_blank" className="text-indigo-600 underline">Open PDF</a>
          ) : (
            <p className="text-sm text-gray-500">No preview available.</p>
          )}
        </DialogContent>
        <DialogFooter>
          <Button onClick={() => setViewCert(null)}>Close</Button>
        </DialogFooter>
      </Dialog>

      {/* Participants Modal */}
      <Dialog open={participantsOpen} onOpenChange={(o) => !o && setParticipantsOpen(false)}>
        <DialogHeader>
          <DialogTitle>Participants</DialogTitle>
          <DialogDescription>{participantsSession?.title}</DialogDescription>
        </DialogHeader>
        <DialogContent>
          {participantsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
            </div>
          ) : participants.length === 0 ? (
            <p className="text-sm text-gray-500">No participants found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-1">Name</th>
                    <th className="py-1">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="py-1">{p.username || p.name || '-'}</td>
                      <td className="py-1">{p.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button onClick={() => setParticipantsOpen(false)}>Close</Button>
        </DialogFooter>
      </Dialog>
    </main>
  );
}
