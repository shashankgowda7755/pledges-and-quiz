"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { href: '/pledges', label: 'Pledges' },
  { href: '/certificates', label: 'Certificates' },
  { href: '/quiz', label: 'Quizzes' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/organizations', label: 'Organizations' },
];

// COMMUNITREE wordmark recolour to forest green.
const LOGO_FILTER = 'brightness(0) saturate(100%) invert(20%) sepia(34%) saturate(1200%) hue-rotate(100deg) brightness(94%)';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-all ${scrolled ? 'bg-cream/85 border-b border-[color:var(--line)] shadow-sm' : 'bg-cream/40 border-b border-transparent'}`}>
      <div className="container-page">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-end gap-3" aria-label="COMMUNITREE & EZONE">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/communitree-logo.png" alt="COMMUNITREE" style={{ height: 38, width: 'auto', display: 'block', filter: LOGO_FILTER }} />
            <span className="text-[color:var(--muted)] text-lg font-light leading-none mb-1.5">&amp;</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ezone-logo.png" alt="EZONE" style={{ height: 30, width: 'auto', display: 'block' }} />
          </Link>

          <nav className="hidden md:flex space-x-7 items-center">
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-[15px] font-medium text-[color:var(--muted)] hover:text-forest transition-colors">
                {l.label}
              </Link>
            ))}
            <Link href="/pledges" className="rounded-full bg-forest text-white px-6 py-2.5 font-semibold hover:bg-forest-700 transition-colors shadow-md shadow-forest/20">
              Take a Pledge
            </Link>
          </nav>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-forest" aria-label="Menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-cream-soft border-t border-[color:var(--line)] absolute w-full left-0 shadow-lg">
          <div className="px-5 pt-4 pb-6 space-y-3 flex flex-col">
            {LINKS.map(l => (
              <Link key={l.href} onClick={() => setIsOpen(false)} href={l.href} className="block text-ink font-medium text-lg py-1">
                {l.label}
              </Link>
            ))}
            <Link onClick={() => setIsOpen(false)} href="/pledges" className="block rounded-full bg-forest text-white px-6 py-3 text-center font-bold mt-2">
              Take a Pledge
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
