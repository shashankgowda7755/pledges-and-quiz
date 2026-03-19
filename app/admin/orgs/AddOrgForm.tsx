'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AddOrgForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    slug: '',
    type: 'school',
    quizPosterUrl: '',
    contactEmail: '',
  });

  const handleNameChange = (value: string) => {
    setForm((f) => ({
      ...f,
      name: value,
      slug: slugify(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to create organization');
        return;
      }

      setForm({ name: '', slug: '', type: 'school', quizPosterUrl: '', contactEmail: '' });
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
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
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-mono text-gray-900"
              placeholder="sparrow-rotary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Type *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900"
            >
              <option value="school">School</option>
              <option value="ngo">NGO</option>
              <option value="company">Company</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              required
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900"
              placeholder="contact@org.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Quiz Poster URL <span className="font-normal text-gray-400 normal-case">(optional, e.g. /images/quizzes/sparrow-rotary.png)</span>
          </label>
          <input
            type="text"
            value={form.quizPosterUrl}
            onChange={(e) => setForm((f) => ({ ...f, quizPosterUrl: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-medium text-gray-900"
            placeholder="/images/quizzes/sparrow-rotary.png"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-teal-500/20"
        >
          {loading ? 'Creating...' : 'Create Organization'}
        </button>
      </form>
    </div>
  );
}
