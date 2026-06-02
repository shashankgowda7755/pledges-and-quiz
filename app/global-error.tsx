'use client';

import { useEffect } from 'react';

// Top-level boundary (catches errors in the root layout too). Auto-recovers
// from stale-chunk errors after a deploy.
function isChunkError(err: Error) {
  const s = `${err?.name} ${err?.message}`;
  return /ChunkLoadError|Loading chunk|dynamically imported module|Failed to fetch|insertBefore|removeChild|not a child/i.test(s);
}

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    console.error('[global-error-boundary]', error?.name, error?.message, 'digest:', error?.digest, error?.stack);
    if (isChunkError(error)) {
      const key = 'chunk-reloaded-at';
      const last = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - last > 10000) {
        sessionStorage.setItem(key, String(Date.now()));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <html>
      <body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 32, gap: 12 }}>
          <p style={{ fontSize: 28, margin: 0 }}>🌳</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Something went wrong</h2>
          <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 420 }}>
            This is usually a temporary glitch from a fresh update. Reloading almost always fixes it.
          </p>
          {(error?.digest || error?.message) && (
            <p style={{ color: '#9ca3af', fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: 420 }}>
              {error.message || ''}{error.digest ? ` · ref ${error.digest}` : ''}
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button onClick={() => reset()} style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Try again
            </button>
            <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: '#14b8a6', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              Reload page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
