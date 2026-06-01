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

export default function AddCertificateForm({ events = [] }: { events?: EventOption[] }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'environment',
    bgImageUrl: '',
    eventDate: '',
    eventId: '',
  });

  const [cert, setCert] = useState<CertConfig>({ name: null, photo: null, images: [] });
  const certConfigured = !!(cert.name || cert.photo || (cert.images && cert.images.length));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pledges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          category: form.category,
          bgImageUrl: form.bgImageUrl,
          eventId: form.eventId || null,
          eventDate: form.eventDate || null,
          // Certificate = certificate-only pledge. No pledge framing, no commitments.
          isCertificateOnly: true,
          impactMetric: 'certificate_issued',
          impactPerUnit: 1,
          commitments: [],
          certConfig: certConfigured ? JSON.stringify(cert) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create certificate');

      router.push('/admin/certificates');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const input = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900';
  const label = 'block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Certificate Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={label}>Certificate Title *</label>
            <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} className={input} placeholder="e.g. Jungle Adventure Kids Summer Camp 2026" />
          </div>
          <div>
            <label className={label}>Slug *</label>
            <input type="text" required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={`${input} font-mono`} placeholder="jungle-adventure-2026" />
          </div>
        </div>

        <div>
          <label className={label}>Description *</label>
          <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`${input} min-h-[100px]`} placeholder="Short blurb shown on the Certificates page." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className={label}>Category *</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={input}>
              <option value="environment">Environment</option>
              <option value="health">Health</option>
              <option value="social">Social</option>
              <option value="lifestyle">Lifestyle</option>
            </select>
          </div>
          <div>
            <label className={label}>Event Date <span className="font-normal text-gray-400 normal-case">(optional)</span></label>
            <input type="date" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} className={input} />
          </div>
          <div>
            <label className={label}>Attach to Event <span className="font-normal text-gray-400 normal-case">(optional)</span></label>
            <select value={form.eventId} onChange={e => setForm(f => ({ ...f, eventId: e.target.value }))} className={input}>
              <option value="">— No event —</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Certificate Background (1080x1350)</h3>
        <PosterImagePicker required value={form.bgImageUrl} onChange={(url) => setForm(f => ({ ...f, bgImageUrl: url }))} />
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Name &amp; Layout Adjuster</h3>
          <p className="text-xs text-gray-500 mt-2">Place the participant&apos;s name, photo, and logos exactly where they belong on the certificate. Drag to move, corner to resize.</p>
        </div>
        <CertificateDesigner bgImageUrl={form.bgImageUrl} value={cert} onChange={setCert} />
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold">{error}</div>}

      <div className="pt-6 flex justify-end">
        <button type="submit" disabled={loading} className="px-8 py-3.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 disabled:opacity-50 transition-all shadow-md shadow-teal-500/20 text-[15px]">
          {loading ? 'Creating…' : 'Publish Certificate'}
        </button>
      </div>
    </form>
  );
}
