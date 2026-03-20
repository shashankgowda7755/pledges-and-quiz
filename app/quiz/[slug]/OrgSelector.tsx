'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Org {
  name: string;
  slug: string;
  posterLogoUrl: string | null;
}

interface Props {
  orgs: Org[];
  quizSlug: string;
  defaultOrg?: string;
}

export default function OrgSelector({ orgs, quizSlug, defaultOrg }: Props) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(defaultOrg ?? null);

  const href = `/quiz/${quizSlug}/take${selectedSlug ? `?org=${selectedSlug}` : ''}`;

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-in fade-in duration-500">
      
      <div className="w-full max-w-xl text-left mb-2">
        <h3 className="text-xl font-extrabold text-gray-900 mb-1">Select your organization</h3>
        <p className="text-sm text-gray-500 font-medium">Choose your school, company, or NGO to log your impact. If you aren't part of one, select General Public.</p>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-3">
        {/* General Public Card */}
        <button
          onClick={() => setSelectedSlug(null)}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
            selectedSlug === null
              ? 'border-teal-500 bg-teal-50/30 shadow-md shadow-teal-500/10'
              : 'border-gray-100 bg-white hover:border-teal-200 hover:bg-gray-50/50'
          }`}
        >
          <div className="flex items-center gap-5">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedSlug === null ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m12.728 0-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 1 0 10A5 5 0 0 1 12 7z" />
              </svg>
            </div>
            <div className="text-left">
              <span className="block text-base font-extrabold text-gray-900">General Public</span>
              <span className="block text-xs font-semibold text-gray-400">Not affiliated with any group</span>
            </div>
          </div>
          
          {/* Radio Button */}
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSlug === null ? 'border-teal-500' : 'border-gray-300'}`}>
             {selectedSlug === null && <div className="w-3 h-3 rounded-full bg-teal-500" />}
          </div>
        </button>

        {/* Organizations List */}
        {orgs.map((org) => (
          <button
            key={org.slug}
            onClick={() => setSelectedSlug(org.slug)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
              selectedSlug === org.slug
                ? 'border-teal-500 bg-teal-50/30 shadow-md shadow-teal-500/10'
                : 'border-gray-100 bg-white hover:border-teal-200 hover:bg-gray-50/50'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full border border-gray-100 overflow-hidden shrink-0">
                {org.posterLogoUrl ? (
                  <img src={org.posterLogoUrl} alt={org.name} className="w-8 h-8 object-contain" />
                ) : (
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <span className="block text-base font-extrabold text-gray-900">{org.name}</span>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Partner Organization</span>
              </div>
            </div>

            {/* Radio Button */}
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${selectedSlug === org.slug ? 'border-teal-500' : 'border-gray-300'}`}>
               {selectedSlug === org.slug && <div className="w-3 h-3 rounded-full bg-teal-500" />}
            </div>
          </button>
        ))}
      </div>

      <div className="pt-6 w-full max-w-xl">
        <Link
          href={href}
          className="flex w-full items-center justify-center bg-teal-500 text-white rounded-2xl px-12 py-5 text-xl font-extrabold hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all hover:-translate-y-1"
        >
          Continue to Quiz
        </Link>
      </div>
    </div>
  );
}
