import React from 'react';
import Sidebar from './components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/30 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-10 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
