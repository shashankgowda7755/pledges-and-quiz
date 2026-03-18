"use client";
import { useState } from 'react';

export function CalendarSubscribe() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h4 className="font-bold text-gray-900 mb-3 text-sm">Never miss a pledge</h4>
      <p className="text-xs text-gray-500 mb-4">Get notified about upcoming events.</p>
      {status === 'done' ? (
        <p className="text-teal-600 text-sm font-medium">You&apos;re subscribed!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full mb-3 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
          {status === 'error' && <p className="text-red-500 text-xs mt-2">Something went wrong. Try again.</p>}
        </form>
      )}
    </div>
  );
}
