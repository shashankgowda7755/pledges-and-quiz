'use client';

import { useEffect } from 'react';

// Recover from stale-chunk errors that happen when a new deploy lands while a
// tab is open: the old HTML asks for JS chunk hashes that no longer exist.
function isChunkError(err: Error) {
  const s = `${err?.name} ${err?.message}`;
  return /ChunkLoadError|Loading chunk|dynamically imported module|Failed to fetch/i.test(s);
}

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isChunkError(error)) {
      // Reload once (guarded) to pull the fresh bundle.
      const key = 'chunk-reloaded-at';
      const last = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - last > 10000) {
        sessionStorage.setItem(key, String(Date.now()));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 gap-4">
      <p className="text-2xl">🌳</p>
      <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
      <p className="text-gray-500 text-sm max-w-md">
        This is usually a temporary glitch from a fresh update. Reloading almost always fixes it.
      </p>
      <div className="flex gap-3 mt-2">
        <button onClick={() => reset()} className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-50">
          Try again
        </button>
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600">
          Reload page
        </button>
      </div>
    </div>
  );
}
