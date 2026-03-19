'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
    >
      Log out
    </button>
  );
}
