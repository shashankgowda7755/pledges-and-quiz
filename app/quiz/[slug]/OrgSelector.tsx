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
    <div className="w-full flex flex-col items-center gap-8">
      {/* Org logo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-2xl">
        {/* General / None card */}
        <button
          onClick={() => setSelectedSlug(null)}
          className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-3 text-center bg-white transition-all ${
            selectedSlug === null
              ? 'border-teal-500 ring-2 ring-teal-300 shadow-lg'
              : 'border-gray-200 hover:border-teal-300'
          }`}
        >
          <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m12.728 0-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 1 0 10A5 5 0 0 1 12 7z" />
          </svg>
          <span className="text-xs font-bold text-gray-500">General Public</span>
        </button>

        {/* Org cards */}
        {orgs.map((org) => (
          <button
            key={org.slug}
            onClick={() => setSelectedSlug(org.slug)}
            className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center bg-white p-3 text-center transition-all ${
              selectedSlug === org.slug
                ? 'border-teal-500 ring-2 ring-teal-300 shadow-lg'
                : 'border-gray-200 hover:border-teal-300'
            }`}
          >
            {org.posterLogoUrl ? (
              <img
                src={org.posterLogoUrl}
                alt={org.name}
                className="w-10 h-10 object-contain mb-2"
              />
            ) : (
              <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            )}
            <span className="text-xs font-bold text-gray-700 leading-tight line-clamp-2">{org.name}</span>
          </button>
        ))}
      </div>

      {/* Start Quiz CTA */}
      <Link
        href={href}
        className="inline-block bg-teal-500 text-white rounded-full px-12 py-5 text-xl font-bold hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all hover:-translate-y-1"
      >
        Start Quiz
      </Link>
    </div>
  );
}
