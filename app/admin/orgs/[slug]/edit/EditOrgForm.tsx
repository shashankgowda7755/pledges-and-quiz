'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LogoPositionEditor, { type LogoPos } from '../../LogoPositionEditor';
import { Organization } from '@prisma/client';
import { downscaleImage } from '@/lib/downscaleImage';

function slugify(str: string) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const DEFAULT_POS: LogoPos = { x: 80, y: 1150, w: 200 };
const DEFAULT_POSTER = '/images/quizzes/sparrow-poster.png';

export default function EditOrgForm({ initialData }: { initialData: Organization }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: initialData.name,
    slug: initialData.slug,
    type: initialData.type,
    quizPosterUrl: initialData.quizPosterUrl || '',
    contactEmail: initialData.contactEmail,
    posterLogoUrl: initialData.posterLogoUrl || '',
    logoPos: initialData.posterLogoPosition ? JSON.parse(initialData.posterLogoPosition) as LogoPos : DEFAULT_POS,
  });

  const posterPreview = form.quizPosterUrl.trim() || DEFAULT_POSTER;

  const handleNameChange = (value: string) => {
    setForm(f => ({ ...f, name: value, slug: slugify(value) }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', await downscaleImage(file)); // cap at 2000px to avoid OOM
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setForm(f => ({ ...f, posterLogoUrl: data.url }));
    } catch (err) {
      setError('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orgs/${initialData.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          type: form.type,
          quizPosterUrl: form.quizPosterUrl || null,
          contactEmail: form.contactEmail,
          posterLogoUrl: form.posterLogoUrl || null,
          posterLogoPosition: form.posterLogoUrl ? JSON.stringify(form.logoPos) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to update organization'); return; }
      
      setSuccess(true);
      router.refresh();
      if (form.slug !== initialData.slug) {
        router.push(`/admin/orgs/${form.slug}/edit`);
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Organization Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => handleNameChange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Slug *</label>
          <input
            type="text"
            required
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-mono text-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Type *</label>
          <select
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900"
          >
            <option value="school">School</option>
            <option value="ngo">NGO</option>
            <option value="company">Company</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Email *</label>
          <input
            type="email"
            required
            value={form.contactEmail}
            onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Custom Poster URL (optional)</label>
        <input
          type="text"
          value={form.quizPosterUrl}
          onChange={e => setForm(f => ({ ...f, quizPosterUrl: e.target.value }))}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900"
        />
      </div>

      <div className="p-5 bg-gray-50/50 border border-gray-100 rounded-2xl">
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Organization Logo</label>
        <div className="flex flex-wrap items-center gap-4">
          {form.posterLogoUrl && (
            <img src={form.posterLogoUrl} alt="Uploaded logo" className="h-14 object-contain rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm" />
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : form.posterLogoUrl ? 'Change Logo' : 'Upload Logo'}
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {form.posterLogoUrl && (
        <div className="p-5 bg-teal-50/30 border border-teal-100 rounded-2xl">
          <label className="block text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-4">Certificate Logo Placement</label>
          <LogoPositionEditor
            posterUrl={posterPreview}
            logoUrl={form.posterLogoUrl}
            position={form.logoPos}
            onChange={pos => setForm(f => ({ ...f, logoPos: pos }))}
          />
        </div>
      )}

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold">{error}</div>}
      {success && <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm font-bold">Successfully updated!</div>}

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-8 py-3.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 disabled:opacity-50 transition-all shadow-md shadow-teal-500/20 text-[15px]"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
