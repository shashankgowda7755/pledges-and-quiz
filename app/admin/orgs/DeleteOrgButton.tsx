'use client';

import { useState } from 'react';
import { Trash2, Loader2, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeleteOrgButton({ slug, isActive }: { slug: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isActive) {
    return (
      <span className="text-xs text-gray-400 italic px-2">Deactivated</span>
    );
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to deactivate ${slug}? This will hide it from the public but keep historical data safe.`)) return;
    
    setLoading(true);
    try {
      await fetch(`/api/admin/orgs/${slug}`, { method: 'DELETE' });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading} 
      title="Deactivate Organization"
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
