import axios from 'axios';

const rawBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
// Normalize base URL: if env already ends with /api, use it as-is; otherwise append /api
const trimmed = rawBase.replace(/\/+$/, '');
const apiBase = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;

export const api = axios.create({
  baseURL: apiBase,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = typeof window !== 'undefined' ? localStorage.getItem('refresh') : null;
        if (!refresh) throw error;
        const r = await axios.post(`${apiBase}/auth/token/refresh/`, { refresh });
        const newAccess = r.data.access;
        if (typeof window !== 'undefined') {
          localStorage.setItem('access', newAccess);
        }
        api.defaults.headers.common = api.defaults.headers.common || {} as any;
        (api.defaults.headers.common as any)['Authorization'] = `Bearer ${newAccess}`;
        original.headers = original.headers || {};
        original.headers['Authorization'] = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        if (typeof window !== 'undefined') {
          const path = window.location?.pathname || '';
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          if (path !== '/login' && path !== '/register') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

// Types
export type User = {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: 'learner' | 'sharer' | 'both';
  points?: number;
};

export type Skill = { id: string; name: string; description?: string; category?: string };
export type Badge = { id: string; name: string; description?: string; icon?: string };
export type Certificate = { id: string; certificate_id: string; pdf_url?: string; qr_code_url?: string; skill: string | Skill };
export type Session = {
  id: string;
  title: string;
  description: string;
  created_by: string | User;
  skill: string | Skill;
  start_time: string;
  end_time: string;
  meeting_link: string;
  is_recorded: boolean;
  recording_url?: string | null;
};

// Helper methods with basic mock fallback
// IMPORTANT: Backend JWT obtain pair endpoint is /api/auth/token/.
// Our api base may already include /api from env; we always call relative path '/auth/token/'.
export type LoginResponse = {
  access: string;
  refresh: string;
  user?: { username: string; role?: string };
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const res = await api.post('/auth/token/', { username, password });
    return res.data as LoginResponse;
  } catch (e) {
    throw e;
  }
}

export async function register(payload: { username: string; email: string; password: string; role: string }) {
  try {
    const res = await api.post('/register/', payload);
    return res.data as { user: User; access: string; refresh: string };
  } catch (e) {
    throw e;
  }
}

export async function getDashboard() {
  try {
    const res = await api.get('/dashboard/');
    return res.data;
  } catch (e) {
    // minimal mock
    return {
      points: 0,
      badges: [],
      sessions_created: 0,
      sessions_joined: 0,
      skills_known: [],
      skills_to_learn: [],
      stats: {
        weekly_learning_hours: [
          { day: 'Mon', hours: 0 },
          { day: 'Tue', hours: 0 },
          { day: 'Wed', hours: 0 },
          { day: 'Thu', hours: 0 },
          { day: 'Fri', hours: 0 },
          { day: 'Sat', hours: 0 },
          { day: 'Sun', hours: 0 },
        ],
        top_skills: [],
      },
    };
  }
}

export async function getUsers() {
  try { const r = await api.get<User[]>('/users/'); return r.data; } catch { return []; }
}
export async function getSkills() {
  try { const r = await api.get<Skill[]>('/skills/'); return r.data; } catch { return []; }
}
export async function searchSkills(query: string) {
  const q = query?.trim();
  if (!q) return [] as Skill[];
  try { const r = await api.get('/skills/', { params: { search: q } }); return r.data?.results ?? r.data ?? []; } catch { return []; }
}
export async function getBadges() {
  try { const r = await api.get<Badge[]>('/badges/'); return r.data; } catch { return []; }
}
export async function getCertificates() {
  try { const r = await api.get<Certificate[]>('/certificates/'); return r.data; } catch { return []; }
}
export async function getCertificatesPaged(page = 1, page_size = 10) {
  try { const r = await api.get('/certificates/mine/', { params: { page, page_size } }); return r.data; } catch { return { results: [], count: 0, next: null, previous: null }; }
}
export async function getSessions() {
  try { const r = await api.get<Session[]>('/sessions/'); return r.data; } catch { return []; }
}
export async function getSessionsBySkill(skillId: string) {
  try { const r = await api.get('/sessions/', { params: { skill: skillId } }); return r.data?.results ?? r.data ?? []; } catch { return []; }
}
export async function getSessionById(id: string) {
  try { const r = await api.get<Session>(`/sessions/${id}/`); return r.data; } catch { return null; }
}

export async function getSessionParticipants(id: string) {
  try { const r = await api.get(`/sessions/${id}/participants/`); return r.data; } catch { return []; }
}

export async function searchSessions(query: string) {
  const q = query?.trim();
  if (!q) return { results: [], count: 0 } as any;
  try { const r = await api.get('/sessions/', { params: { search: q } }); return r.data; } catch { return { results: [], count: 0 } as any; }
}

export async function uploadSessionVideo(sessionId: string, file: File) {
  const form = new FormData();
  form.append('video', file);
  const r = await api.post(`/sessions/${sessionId}/upload_video/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return r.data;
}

// Generic uploader used by MentorDashboard modal. It prefers a bulk endpoint
// `/sessions/upload/` if available, otherwise falls back to per-session upload
// using `session_id` and `video` fields from the provided FormData.
export async function uploadVideo(formData: FormData) {
  try {
    const r = await api.post(`/sessions/upload/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return r.data;
  } catch (err: any) {
    // Fallback to existing endpoint if server doesn't support /sessions/upload/
    if (err?.response?.status === 404) {
      const sessionId = String(formData.get('session_id') || '').trim();
      const file = formData.get('video');
      if (!sessionId || !(file instanceof File)) throw err;
      return uploadSessionVideo(sessionId, file);
    }
    throw err;
  }
}

// List sessions created by current user. Uses /sessions/mine/ if available,
// otherwise falls back to filtering /sessions/ by created_by decoded from access token.
export async function getMySessions(page = 1, page_size = 10) {
  try {
    const r = await api.get('/sessions/mine/', { params: { page, page_size } });
    return r.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const { getUserIdFromAccess } = await import('./jwt');
      const uid = getUserIdFromAccess();
      if (!uid) return { results: [], count: 0, next: null, previous: null } as any;
      const r2 = await api.get('/sessions/', { params: { created_by: uid, page, page_size } });
      return r2.data;
    }
    throw err;
  }
}

// Mentors and Wishlist helpers for Explore
export async function getMentors() {
  try { const r = await api.get('/users/', { params: { role: 'mentor' } }); return r.data?.results ?? r.data ?? []; } catch { return []; }
}

export async function getMentorMe() {
  try {
    const r = await api.get('/mentors/me/');
    return r.data;
  } catch (e) {
    throw e;
  }
}

export async function getWishlistMine() {
  try { const r = await api.get('/wishlist/mine/'); return r.data?.results ?? r.data ?? []; } catch { return []; }
}

export async function addToWishlist(payload: { session_id: string }) {
  try {
    const r = await api.post('/wishlist/add/', payload);
    return r.data;
  } catch (e) {
    throw e;
  }
}

export async function removeFromWishlist(session_id: string) {
  try {
    const r = await api.post('/wishlist/remove/', { session_id });
    return r.data;
  } catch (e) {
    throw e;
  }
}

// Delete a session by id (mentor/owner enforcement is server-side)
export async function deleteSession(id: string) {
  try {
    const r = await api.delete(`/sessions/${id}/`);
    return r.data ?? { success: true };
  } catch (e) {
    throw e;
  }
}
