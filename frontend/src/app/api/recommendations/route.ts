import { NextResponse } from "next/server";

// Django API root for sessions
const DJANGO_API_ROOT = "http://127.0.0.1:8000/api";
const SESSIONS_ENDPOINT = `${DJANGO_API_ROOT}/sessions/`;

type SessionItem = {
  id?: string | number;
  title?: string;
  name?: string;
  description?: string;
  summary?: string;
  url?: string; // direct session URL if provided
  video_url?: string; // some APIs may use this
  link?: string; // fallback link field
  topic?: string;
  skill?: string;
  skills?: string[] | string;
  tags?: string[] | string;
};

function norm(s: string) {
  return (s || "").toString().trim().toLowerCase();
}

function slug(s: string) {
  return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function fuzzyIncludes(a: string, b: string) {
  const A = norm(a);
  const B = norm(b);
  return !!A && !!B && (A.includes(B) || B.includes(A));
}

function toArray(v?: string[] | string): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function coerce(item: SessionItem) {
  const title = item.title ?? item.name ?? item.topic ?? "Untitled Session";
  const description = item.description ?? item.summary ?? "";
  const tags = [
    ...toArray(item.tags),
    ...toArray(item.skills),
    item.topic ? String(item.topic) : "",
    item.skill ? String(item.skill) : "",
  ].filter(Boolean);
  // Always prefer internal session page when id exists
  const url = item.id ? `/sessions/${item.id}` : item.url ?? item.video_url ?? item.link ?? "#";
  return { id: String(item.id ?? slug(title || url)), title, description, url, tags };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = (searchParams.get("skills_to_learn") || "").trim();
  console.log("[AIRec API] incoming raw:", raw);

  const skills = raw
    .split(",")
    .map((s) => norm(s))
    .filter(Boolean);
  console.log("[AIRec API] parsed skills:", skills);

  // Fetch sessions from Django backend
  let sessions: any = [];
  try {
    const res = await fetch(SESSIONS_ENDPOINT, { cache: "no-store" });
    console.log("[AIRec API] fetch", SESSIONS_ENDPOINT, "status:", res.status);
    const json = await res.json();
    // Accept either array or wrapped in results/data/items
    sessions = Array.isArray(json) ? json : json?.results ?? json?.data ?? json?.items ?? [];
  } catch (e) {
    console.log("[AIRec API] error fetching sessions:", e);
    sessions = [];
  }

  const catalog = (sessions as SessionItem[]).map(coerce);

  // Compute score by fuzzy matching against title/description/tags
  const scored = catalog.map((v) => {
    const titleHit = skills.some((s) => fuzzyIncludes(v.title, s));
    const descHit = skills.some((s) => fuzzyIncludes(v.description, s));
    const tagHit = v.tags?.some((t: string) => skills.some((s) => fuzzyIncludes(t, s)));
    const score = Number(titleHit) + Number(descHit) + (tagHit ? 1 : 0);
    return { video: v, score };
  });

  const matches = scored
    .filter((x) => (skills.length ? x.score > 0 : false))
    .sort((a, b) => b.score - a.score)
    .map((x) => ({ id: x.video.id, title: x.video.title, description: x.video.description, url: x.video.url }));

  console.log("[AIRec API] returning count:", matches.length, matches.map((m) => m.title));

  // Return only matched sessions; empty array when none
  return NextResponse.json({ videos: matches }, { status: 200 });
}
