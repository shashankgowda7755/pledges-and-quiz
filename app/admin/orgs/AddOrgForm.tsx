'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LogoPositionEditor, { type LogoPos } from './LogoPositionEditor';

function slugify(str: string) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const DEFAULT_POS: LogoPos = { x: 80, y: 1150, w: 200 };
const DEFAULT_POSTER = '/images/quizzes/sparrow-poster.png';

export default function AddOrgForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    type: 'school',
    quizPosterUrl: '',
    contactEmail: '',
    posterLogoUrl: '',
    logoPos: DEFAULT_POS as LogoPos,
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
      fd.append('file', file);
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
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
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
      if (!res.ok) { setError(data.error ?? 'Failed to create organization'); return; }
      setForm({ name: '', slug: '', type: 'school', quizPosterUrl: '', contactEmail: '', posterLogoUrl: '', logoPos: DEFAULT_POS });
      setOpen(false);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-8 px-6 py-3 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 transition-colors shadow-md shadow-teal-500/20 text-sm"
      >
        + Add New Organization
      </button>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-extrabold text-gray-900">Add New Organization</h2>
        <button
          onClick={() => { setOpen(false); setError(''); }}
          className="text-gray-400 hover:text-gray-600 text-sm font-medium"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name + Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900"
              placeholder="Sparrow Rotary Club"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Slug * <span className="font-normal text-gray-400 normal-case">(used in URL)</span>
            </label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-mono text-gray-900"
              placeholder="sparrow-rotary"
            />
          </div>
        </div>

        {/* Type + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Type *</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900"
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
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900"
              placeholder="contact@org.com"
            />
          </div>
        </div>

        {/* Custom Poster URL (optional) */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Custom Poster URL <span className="font-normal text-gray-400 normal-case">(optional — leave blank for default)</span>
          </label>
          <input
            type="text"
            value={form.quizPosterUrl}
            onChange={e => setForm(f => ({ ...f, quizPosterUrl: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900"
            placeholder="/images/quizzes/sparrow-rotary.png"
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Organization Logo
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50 text-teal-700 text-sm font-semibold hover:bg-teal-100 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Uploading…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {form.posterLogoUrl ? 'Change Logo' : 'Upload Logo'}
                </>
              )}
            </button>

            {form.posterLogoUrl && (
              <img
                src={form.posterLogoUrl}
                alt="Uploaded logo"
                className="h-10 object-contain rounded border border-gray-200 bg-gray-50 px-1"
              />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleUpload}
          />
          <p className="text-[11px] text-gray-400 mt-1.5">PNG with transparent background works best.</p>
        </div>

        {/* Visual Logo Position Editor — shown once logo is uploaded */}
        {form.posterLogoUrl && (
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Logo Position on Certificate
            </label>
            <LogoPositionEditor
              posterUrl={posterPreview}
              logoUrl={form.posterLogoUrl}
              position={form.logoPos}
              onChange={pos => setForm(f => ({ ...f, logoPos: pos }))}
            />
          </div>
        )}

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full py-3.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-teal-500/20"
        >
          {loading ? 'Creating…' : 'Create Organization'}
        </button>
      </form>
    </div>
  );
}
