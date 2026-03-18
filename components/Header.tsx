"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, CheckCircle } from 'lucide-react';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2">
            <CheckCircle className="w-8 h-8 text-teal-400" />
            <span className="font-montserrat font-bold text-2xl text-teal-500 tracking-tight">PledgeMarks</span>
          </Link>

          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/pledges" className="text-gray-600 hover:text-teal-500 font-medium transition-colors">Active Pledges</Link>
            <Link href="/quiz" className="text-gray-600 hover:text-teal-500 font-medium transition-colors">Quizzes</Link>
            <Link href="/calendar" className="text-gray-600 hover:text-teal-500 font-medium transition-colors">Calendar</Link>
            <Link href="/organizations" className="text-gray-600 hover:text-teal-500 font-medium transition-colors">Organizations</Link>
            <Link href="/pledges" className="bg-teal-400 text-white rounded-full px-6 py-2.5 hover:bg-teal-500 font-semibold transition-colors">Take a Pledge</Link>
          </nav>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0">
          <div className="px-4 pt-4 pb-6 space-y-4 shadow-lg flex flex-col">
            <Link onClick={() => setIsOpen(false)} href="/pledges" className="block text-gray-800 font-medium text-lg">Active Pledges</Link>
            <Link onClick={() => setIsOpen(false)} href="/quiz" className="block text-gray-800 font-medium text-lg">Quizzes</Link>
            <Link onClick={() => setIsOpen(false)} href="/calendar" className="block text-gray-800 font-medium text-lg">Calendar</Link>
            <Link onClick={() => setIsOpen(false)} href="/organizations" className="block text-gray-800 font-medium text-lg">Organizations</Link>
            <Link onClick={() => setIsOpen(false)} href="/pledges" className="block bg-teal-400 text-white rounded-full px-6 py-3 text-center font-bold">Take a Pledge</Link>
          </div>
        </div>
      )}
    </header>
  );
}
