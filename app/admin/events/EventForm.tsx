'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

function slugify(str: string) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function toDateInput(d: string | Date | null | undefined) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export type EventInitial = {
  slug: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  startDate: string | Date;
  endDate: string | Date | null;
  location: string | null;
  isActive: boolean;
  isFeatured: boolean;
  hostOrgId: string | null;
};

type OrgOption = { id: string; name: string };

export default function EventForm({
  orgs,
  initialData,
}: {
  orgs: OrgOption[];
  initialData?: EventInitial;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(initialData);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    description: initialData?.description ?? '',
    bannerUrl: initialData?.bannerUrl ?? '',
    startDate: toDateInput(initialData?.startDate),
    endDate: toDateInput(initialData?.endDate),
    location: initialData?.location ?? '',
    hostOrgId: initialData?.hostOrgId ?? '',
    isFeatured: initialData?.isFeatured ?? false,
    isActive: initialData?.isActive ?? true,
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setForm(f => ({ ...f, bannerUrl: data.url }));
    } catch (err) {
      setError('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error') + '. You can paste a banner URL instead.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      bannerUrl: form.bannerUrl || null,
      startDate: form.startDate,
      endDate: form.endDate || null,
      location: form.location || null,
      hostOrgId: form.hostOrgId || null,
      isFeatured: form.isFeatured,
      ...(isEdit ? { isActive: form.isActive } : {}),
    };

    try {
      const url = isEdit ? `/api/admin/events/${initialData!.slug}` : '/api/admin/events';
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to save event'); return; }
      router.push('/admin/events');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const input = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900';
  const label = 'block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Event Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={label}>Event Title *</label>
            <input
              type="text" required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: isEdit ? f.slug : slugify(e.target.value) }))}
              className={input} placeholder="e.g. World Sparrow Day 2026"
            />
          </div>
          <div>
            <label className={label}>Slug *</label>
            <input
              type="text" required value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className={`${input} font-mono`} placeholder="world-sparrow-day-2026"
            />
          </div>
        </div>

        <div>
          <label className={label}>Description *</label>
          <textarea
            required value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className={`${input} min-h-[100px]`} placeholder="What is this event about?"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className={label}>Start Date *</label>
            <input type="date" required value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className={input} />
          </div>
          <div>
            <label className={label}>End Date <span className="font-normal text-gray-400 normal-case">(optional)</span></label>
            <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className={input} />
          </div>
          <div>
            <label className={label}>Location <span className="font-normal text-gray-400 normal-case">(optional)</span></label>
            <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={input} placeholder="Bengaluru / Online" />
          </div>
        </div>

        <div>
          <label className={label}>Host Organization <span className="font-normal text-gray-400 normal-case">(optional)</span></label>
          <select value={form.hostOrgId} onChange={e => setForm(f => ({ ...f, hostOrgId: e.target.value }))} className={input}>
            <option value="">— None —</option>
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Banner Image <span className="text-xs font-normal text-gray-400">(optional)</span></h3>
        <input type="text" value={form.bannerUrl} onChange={e => setForm(f => ({ ...f, bannerUrl: e.target.value }))} className={input} placeholder="Paste a banner image URL" />
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
            {uploading ? 'Uploading…' : 'Upload Banner'}
          </button>
          {form.bannerUrl && <img src={form.bannerUrl} alt="Banner preview" className="h-16 rounded border object-cover" />}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
          <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 accent-teal-500" />
          Featured event
        </label>
        {isEdit && (
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-teal-500" />
            Active (visible to public)
          </label>
        )}
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold">{error}</div>}

      <div className="pt-6 flex justify-end">
        <button type="submit" disabled={loading || uploading} className="px-8 py-3.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 disabled:opacity-50 transition-all shadow-md shadow-teal-500/20 text-[15px]">
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
        </button>
      </div>
    </form>
  );
}
