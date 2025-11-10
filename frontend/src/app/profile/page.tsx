'use client';

import React, { useEffect, useState, useRef } from 'react';

/**
 * Derive initials safely from name.
 */
function getInitials(name: string | null | undefined) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase();
}

type ProfileResponse = {
  avatar?: string | null;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
};

export default function ProfilePage() {
  /**
   * Hydration Safety:
   * We start with `mounted = false` so that the server & first client render match (a skeleton only).
   * Then after `useEffect`, we set `mounted = true` and render initials/image safely.
   */
  const [mounted, setMounted] = useState(false);

  // Data state
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Upload-related
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mark as mounted (runs only in browser)
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * After mount → safely access localStorage.
   * 1. Load cached bio/avatarUrl for instant UI.
   * 2. Then fetch the latest profile from API and update localStorage.
   */
  useEffect(() => {
    if (!mounted) return;

    try {
      const cachedBio = localStorage.getItem('profile.bio') || '';
      const cachedAvatar = localStorage.getItem('profile.avatarUrl');
      if (cachedBio) setBio(cachedBio);
      if (cachedAvatar) setAvatarUrl(cachedAvatar || null);
    } catch {
      /* ignore */
    }

    async function loadProfile() {
      try {
        const token = localStorage.getItem('access');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch('/api/user/profile/', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const data: ProfileResponse = await res.json();
        const normalizedAvatar =
          data.avatarUrl ?? data.avatar_url ?? data.avatar ?? null;
        const normalizedBio = data.bio ?? '';

        setAvatarUrl(normalizedAvatar);
        setBio(normalizedBio);

        try {
          localStorage.setItem('profile.avatarUrl', normalizedAvatar ?? '');
          localStorage.setItem('profile.bio', normalizedBio);
        } catch {
          /* ignore */
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [mounted]);

  // Handle file select + preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  // Save bio + avatar to backend
  const handleSave = async () => {
    if (!mounted) return;
    const token = localStorage.getItem('access');
    if (!token) {
      alert('Please login first');
      return;
    }

    const form = new FormData();
    form.append('bio', bio);
    if (selectedFile) form.append('avatar', selectedFile);

    setSaving(true);
    try {
      const res = await fetch('/api/user/profile/', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        alert('Failed to save changes.');
        return;
      }

      const data: ProfileResponse = await res.json();
      const normalizedAvatar =
        data.avatarUrl ?? data.avatar_url ?? data.avatar ?? null;

      setAvatarUrl(normalizedAvatar);
      setPreviewUrl(null);
      setSelectedFile(null);

      localStorage.setItem('profile.avatarUrl', normalizedAvatar ?? '');
      localStorage.setItem('profile.bio', bio);

      alert('Profile updated successfully!');
    } catch {
      alert('Network error.');
    } finally {
      setSaving(false);
    }
  };

  // SAFELY derive initials only on client
  const initials = mounted
    ? getInitials(localStorage.getItem('userName'))
    : '';

  // HYDRATION-SAFE rendering
  if (!mounted) {
    return (
      <div className="mx-auto max-w-3xl p-6 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="flex gap-6 items-center">
          <div className="h-24 w-24 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
            <div className="flex gap-3">
              <div className="h-9 w-32 bg-gray-200 rounded" />
              <div className="h-9 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pick the avatar to show (preview > saved > initials)
  const avatarToShow = previewUrl || avatarUrl;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">My Profile</h1>

      <div className="mt-6 flex items-start gap-6">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full overflow-hidden border bg-gray-50 text-gray-700">
            {loading ? (
              <div className="h-full w-full animate-pulse bg-gray-200" />
            ) : avatarToShow ? (
              <img
                src={avatarToShow}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl select-none">{initials}</span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border p-2 bg-white dark:bg-gray-950"
            placeholder="Write something about yourself..."
          />

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={handleUploadClick}
              className="h-9 px-3 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Upload New Picture
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="h-9 px-3 bg-black text-white rounded-md disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
