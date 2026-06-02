'use client';

import { useState } from 'react';
import RecycleOverlay from './RecycleOverlay';

// Compact popover: overlays the recycle ring on an existing photo (e.g. org logo).
// Allows swapping in a different upload too. Mirrors QrCodeButton UX.
export default function RecycleButton({
  photoSrc,
  filename = 'recycle-frame',
}: {
  photoSrc?: string;
  filename?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50"
      >
        ♻︎
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
            <RecycleOverlay photoSrc={photoSrc} allowUpload filename={filename} />
          </div>
        </>
      )}
    </div>
  );
}
