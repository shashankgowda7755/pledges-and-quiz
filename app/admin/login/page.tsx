'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.ok) {
        router.push('/admin/orgs');
      } else {
        setError(data.error ?? 'Wrong password');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 mb-4">
            <span className="text-2xl">🌳</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">COMMUNITREE &amp; EZONE</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 focus:bg-white transition-all outline-none font-medium text-gray-900"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-teal-500/20"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
