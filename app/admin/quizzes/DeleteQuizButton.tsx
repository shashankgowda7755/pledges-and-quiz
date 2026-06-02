'use client';

import { useState } from 'react';
import { Power, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Two-way active toggle. Deactivating keeps the quiz visible but closes
// entries ("This event is over"); activating re-opens it.
export default function DeleteQuizButton({ slug, isActive }: { slug: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    const next = !isActive;
    const verb = next ? 'reactivate' : 'deactivate';
    if (!confirm(`Are you sure you want to ${verb} the quiz "${slug}"?`)) return;

    setLoading(true);
    try {
      await fetch(`/api/admin/quizzes/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isActive ? 'Deactivate (close entries)' : 'Activate (re-open entries)'}
      className={`p-2 rounded-lg transition-colors cursor-pointer ${
        isActive ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
      }`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
    </button>
  );
}
