'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

function slugify(str: string) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AddPledgeForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'environment',
    bgImageUrl: '',
    impactMetric: 'bottles_saved',
    impactPerUnit: '1',
  });

  const [commitments, setCommitments] = useState<string[]>(Array(10).fill(''));

  const handleCommitmentChange = (index: number, value: string) => {
    const newArr = [...commitments];
    newArr[index] = value;
    setCommitments(newArr);
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
      setForm(f => ({ ...f, bgImageUrl: data.url }));
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
    
    const validCommitments = commitments.filter(c => c.trim().length > 0);
    if (validCommitments.length === 0) {
      setError('You must provide at least one commitment.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/pledges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          impactPerUnit: parseFloat(form.impactPerUnit),
          commitments: validCommitments
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create pledge');
      
      router.push('/admin/pledges');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Details</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Pledge Title *</label>
            <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900" placeholder="e.g. Save The Oceans" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Slug *</label>
            <input type="text" required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-mono text-gray-900" placeholder="save-the-oceans" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Description *</label>
          <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900 min-h-[100px]" placeholder="A short blurb describing why people should take this pledge." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Category *</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 font-medium">
              <option value="environment">Environment</option>
              <option value="health">Health</option>
              <option value="social">Social</option>
              <option value="lifestyle">Lifestyle</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Impact Metric Code *</label>
            <input type="text" required value={form.impactMetric} onChange={e => setForm(f => ({ ...f, impactMetric: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 font-mono" placeholder="bottles_saved" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Impact Multiplier *</label>
            <input type="number" step="0.1" required value={form.impactPerUnit} onChange={e => setForm(f => ({ ...f, impactPerUnit: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 font-medium" placeholder="10" />
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Background Poster (1080x1350)</h3>
        <div className="flex flex-col gap-4">
          <input type="text" required value={form.bgImageUrl} onChange={e => setForm(f => ({ ...f, bgImageUrl: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 font-medium" placeholder="URL of background image" />
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Upload Image to Vercel'}
            </button>
            {form.bgImageUrl && <img src={form.bgImageUrl} alt="Preview" className="h-16 rounded border" />}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">The 10 Commitments</h3>
        <p className="text-xs text-gray-500 mb-4">Users will check these boxes. Fill out at least one.</p>
        <div className="space-y-3">
          {commitments.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 text-center text-xs font-bold text-gray-400">{i + 1}</span>
              <input type="text" value={c} onChange={e => handleCommitmentChange(i, e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 outline-none font-medium text-gray-900" placeholder={`Commitment #${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold">{error}</div>}

      <div className="pt-6 flex justify-end">
        <button type="submit" disabled={loading || uploading} className="px-8 py-3.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 disabled:opacity-50 transition-all shadow-md shadow-teal-500/20 text-[15px]">
          {loading ? 'Creating...' : 'Launch Pledge'}
        </button>
      </div>
    </form>
  );
}
