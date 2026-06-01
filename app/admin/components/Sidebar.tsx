'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, HeartHandshake, CheckSquare, LayoutDashboard, Users, CalendarDays, Award } from 'lucide-react';
import LogoutButton from '../orgs/LogoutButton';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Events', href: '/admin/events', icon: CalendarDays },
    { name: 'Organizations', href: '/admin/orgs', icon: Building2 },
    { name: 'Pledges', href: '/admin/pledges', icon: HeartHandshake },
    { name: 'Quizzes', href: '/admin/quizzes', icon: CheckSquare },
    { name: 'Certificates', href: '/admin/certificates', icon: Award },
    { name: 'Submissions', href: '/admin/submissions', icon: Users },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-screen top-0 left-0">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <span className="text-2xl">🌳</span>
        <span className="font-extrabold text-gray-900 tracking-tight">Admin<span className="text-teal-500">Panel</span></span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                isActive 
                  ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100/50' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-3 px-4 py-3">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
