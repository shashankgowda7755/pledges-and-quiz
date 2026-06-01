'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PosterImagePicker from '@/components/PosterImagePicker';
import CertificateDesigner from '@/components/CertificateDesigner';
import type { CertConfig } from '@/components/PledgePosterCanvas';

function slugify(str: string) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type EventOption = { id: string; title: string };

export default function AddPledgeForm({ events = [] }: { events?: EventOption[] }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'environment',
    bgImageUrl: '',
    impactMetric: 'bottles_saved',
    impactPerUnit: '1',
    eventId: '',
    isCertificateOnly: false,
  });

  const [cert, setCert] = useState<CertConfig>({ name: null, photo: null, images: [] });
  const certEnabled = !!(cert.name || cert.photo || (cert.images && cert.images.length));

  const [commitments, setCommitments] = useState<string[]>(Array(10).fill(''));

  const handleCommitmentChange = (index: number, value: string) => {
    const newArr = [...commitments];
    newArr[index] = value;
    setCommitments(newArr);
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
          certConfig: certEnabled ? JSON.stringify(cert) : null,
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

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Attach to Event <span className="font-normal text-gray-400 normal-case">(optional)</span></label>
          <select value={form.eventId} onChange={e => setForm(f => ({ ...f, eventId: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 font-medium">
            <option value="">— No event —</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
          </select>
        </div>

        <label className="flex items-start gap-3 bg-teal-50/50 border border-teal-100 rounded-xl p-4 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isCertificateOnly}
            onChange={e => setForm(f => ({ ...f, isCertificateOnly: e.target.checked }))}
            className="w-4 h-4 mt-0.5 accent-teal-500"
          />
          <span>
            <span className="block text-sm font-bold text-gray-800">Certificate-only mode</span>
            <span className="block text-xs text-gray-500 mt-0.5">Lists this under the public <strong>Certificates</strong> page and hides pledge framing — no commitment counter, &ldquo;Get Certificate&rdquo; wording instead of &ldquo;Take Pledge&rdquo;.</span>
          </span>
        </label>
      </div>

      <div className="space-y-6 pt-4 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Background Poster (1080x1350)</h3>
        <PosterImagePicker
          required
          value={form.bgImageUrl}
          onChange={(url) => setForm(f => ({ ...f, bgImageUrl: url }))}
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Certificate Layout <span className="text-xs font-normal text-gray-400">(optional)</span></h3>
          <p className="text-xs text-gray-500 mt-2">Place the participant&apos;s name, photo, and logos on the poster. Leave all off to use the default layout.</p>
        </div>
        <CertificateDesigner bgImageUrl={form.bgImageUrl} value={cert} onChange={setCert} />
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
        <button type="submit" disabled={loading} className="px-8 py-3.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 disabled:opacity-50 transition-all shadow-md shadow-teal-500/20 text-[15px]">
          {loading ? 'Creating...' : 'Launch Pledge'}
        </button>
      </div>
    </form>
  );
}
