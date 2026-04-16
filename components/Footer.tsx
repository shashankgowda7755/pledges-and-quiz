"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
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
    <footer className="bg-gray-50 border-t border-gray-200 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-montserrat font-bold text-xl text-gray-900 mb-4">Stay updated on next month&apos;s special days.</h3>
            {status === 'done' ? (
              <p className="text-teal-600 font-medium">You&apos;re subscribed!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-gray-900 text-white rounded-lg px-6 py-3 font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                  {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
            {status === 'error' && <p className="text-red-500 text-sm mt-2">Something went wrong. Try again.</p>}
            <p className="text-gray-500 text-sm mt-3">Monthly digest. Unsubscribe anytime.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms</Link></li>
              <li><a href="mailto:hello@pledgemarks.com" className="text-gray-600 hover:text-gray-900">hello@pledgemarks.com</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-200 text-center text-gray-500">
          <div className="flex justify-center mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/communitree-logo.png" alt="COMMUNITREE" style={{ height: 40, width: 'auto', display: 'block', filter: 'brightness(0) invert(0.5) sepia(1) hue-rotate(110deg) saturate(5) brightness(0.55)' }} />
          </div>
          <p className="font-medium text-gray-900 mb-1">COMMUNITREE — Turn Intention into Action.</p>
          <p>© {new Date().getFullYear()} COMMUNITREE.</p>
        </div>
      </div>
    </footer>
  );
}
