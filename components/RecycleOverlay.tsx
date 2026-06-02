'use client';

import { useEffect, useRef, useState } from 'react';

// Layers a transparent PNG (e.g. recycle ring) on top of a photo.
// - Live preview: CSS-stacked, logo absolute over photo.
// - Download: composites photo + logo onto a <canvas> -> single PNG.
// Photo renders BEHIND, logo ON TOP (center of ring stays transparent so photo shows through).
export default function RecycleOverlay({
  photoSrc: initialPhoto,
  logoSrc = '/recycle-ring.png',
  allowUpload = false,
  filename = 'recycled',
  size = 512,
  className = '',
}: {
  photoSrc?: string;
  logoSrc?: string;
  allowUpload?: boolean;
  filename?: string;
  size?: number;
  className?: string;
}) {
  const [photoSrc, setPhotoSrc] = useState<string | undefined>(initialPhoto);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => setPhotoSrc(initialPhoto), [initialPhoto]);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoSrc(reader.result as string);
    reader.readAsDataURL(f);
  };

  // load an image, cross-origin enabled so canvas isn't tainted on remote photos
  const loadImg = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`load failed: ${src}`));
      img.src = src;
    });

  const download = async () => {
    if (!photoSrc) return;
    setBusy(true);
    setErr(null);
    try {
      const [photo, logo] = await Promise.all([loadImg(photoSrc), loadImg(logoSrc)]);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      // photo: cover-fit (fill square, crop overflow)
      const scale = Math.max(size / photo.width, size / photo.height);
      const w = photo.width * scale;
      const h = photo.height * scale;
      ctx.drawImage(photo, (size - w) / 2, (size - h) / 2, w, h);

      // logo: contain-fit on top, centered
      ctx.drawImage(logo, 0, 0, size, size);

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${filename}.png`;
      a.click();
    } catch (e: any) {
      setErr(e?.message || 'export failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* live preview — photo behind, logo on top */}
      <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl bg-gray-100 border border-gray-200">
        {photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoSrc} alt="photo" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-xs text-gray-400">No photo</div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="recycle overlay" className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
      </div>

      {allowUpload && (
        <label className="w-full max-w-[280px] cursor-pointer rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-center text-xs font-bold text-gray-600 hover:bg-gray-50">
          {photoSrc ? 'Change photo' : 'Upload photo'}
          <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
        </label>
      )}

      <button
        type="button"
        onClick={download}
        disabled={!photoSrc || busy}
        className="w-full max-w-[280px] rounded-lg bg-teal-500 py-2 text-xs font-bold text-white transition-colors hover:bg-teal-600 disabled:opacity-40"
      >
        {busy ? 'Building…' : 'Download PNG'}
      </button>
      {err && <p className="text-[10px] text-red-500">{err}</p>}
    </div>
  );
}
