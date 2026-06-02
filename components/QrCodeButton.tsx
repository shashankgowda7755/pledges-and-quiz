'use client';

import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

// Generates a static, downloadable QR for any URL — used for magic links so
// admins don't need an external QR converter.
export default function QrCodeButton({ url, filename = 'qr-code' }: { url: string; filename?: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const download = () => {
    const canvas = wrapRef.current?.querySelector('canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${filename}.png`;
    a.click();
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="shrink-0 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold px-3 py-1.5 transition-colors"
      >
        QR
      </button>

      {open && (
        <>
          {/* click-away */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-gray-200 bg-white shadow-xl p-4 flex flex-col items-center gap-3">
            <div ref={wrapRef} className="bg-white p-2 rounded-lg border border-gray-100">
              <QRCodeCanvas value={url} size={200} level="M" marginSize={2} />
            </div>
            <p className="text-[10px] text-gray-400 font-mono break-all text-center leading-snug">{url}</p>
            <button
              type="button"
              onClick={download}
              className="w-full rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold py-2 transition-colors"
            >
              Download PNG
            </button>
          </div>
        </>
      )}
    </div>
  );
}
