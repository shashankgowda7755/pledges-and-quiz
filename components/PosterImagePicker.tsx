'use client';

import { useCallback, useState } from 'react';
import type { Area } from 'react-easy-crop';
import Cropper from 'react-easy-crop';
import { Crop, UploadCloud, X, Loader2, Link as LinkIcon } from 'lucide-react';
import getCroppedImg from '@/utils/cropImage';
import { downscaleImage } from '@/utils/downscaleImage';

// Poster slot is rendered at 1080×1350 (4:5 portrait) across the app.
const POSTER_W = 1080;
const POSTER_H = 1350;
const ASPECT = POSTER_W / POSTER_H;

/**
 * Re-render an arbitrary cropped data URL onto a fixed 1080×1350 canvas so
 * every uploaded background matches the poster slot exactly, then hand back
 * a JPEG blob small enough to upload quickly.
 */
async function normalizeToPoster(croppedDataUrl: string, quality = 0.9): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = croppedDataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = POSTER_W;
  canvas.height = POSTER_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, POSTER_W, POSTER_H);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      quality
    );
  });
}

export default function PosterImagePicker({
  value,
  onChange,
  required = false,
}: {
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}) {
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setProcessing(true);
    try {
      const dataUrl = await downscaleImage(file);
      setRawImageSrc(dataUrl);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch {
      setError('Could not read that image. Try a different file.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!rawImageSrc || !croppedAreaPixels) return;
    setUploading(true);
    setError('');
    try {
      const cropped = await getCroppedImg(rawImageSrc, croppedAreaPixels);
      if (!cropped) throw new Error('Crop failed');
      const blob = await normalizeToPoster(cropped);

      const fd = new FormData();
      fd.append('file', new File([blob], `poster-${POSTER_W}x${POSTER_H}.jpg`, { type: 'image/jpeg' }));
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');

      onChange(data.url);
      setRawImageSrc(null);
    } catch (err) {
      setError('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Manual URL fallback */}
      <div className="flex items-center gap-2">
        <LinkIcon className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 outline-none font-medium text-gray-900"
          placeholder="Paste an image URL, or upload + crop below"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
          {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          {processing ? 'Reading…' : 'Upload & Crop'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={processing} />
        </label>

        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Poster preview" className="h-20 w-16 object-cover rounded-lg border border-gray-200" />
        )}
        <span className="text-xs text-gray-400 font-medium">Crops to {POSTER_W}×{POSTER_H}</span>
      </div>

      {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

      {/* Crop modal */}
      {rawImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-[1.5rem] w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Crop className="w-4 h-4 text-teal-500" /> Crop Poster Background
              </h3>
              <button type="button" onClick={() => setRawImageSrc(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full h-[360px] sm:h-[440px] bg-black">
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT}
                showGrid
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="px-4 pt-4">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-teal-500"
                aria-label="Zoom"
              />
            </div>

            <div className="p-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRawImageSrc(null)}
                className="px-5 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={uploading}
                className="px-5 py-2.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 disabled:opacity-50 shadow-md transition-colors inline-flex items-center gap-2"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploading ? 'Uploading…' : 'Crop & Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
