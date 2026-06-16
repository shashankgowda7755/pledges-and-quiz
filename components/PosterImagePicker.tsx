'use client';

import { useState } from 'react';
import { UploadCloud, Loader2, Link as LinkIcon } from 'lucide-react';
import { downscaleImage } from '@/lib/downscaleImage';

/**
 * Background image uploader. Uploads the file exactly as chosen — original
 * dimensions, original aspect, no crop or resize. Whatever the user uploads is
 * what gets stored and rendered. Keeps a manual URL field as a fallback.
 *
 * targetW/targetH/label are accepted for call-site compatibility and shown only
 * as a recommended-size hint; they no longer force the output size.
 */
export default function PosterImagePicker({
  value,
  onChange,
  required = false,
  targetW,
  targetH,
}: {
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  /** Recommended width hint only (not enforced). */
  targetW?: number;
  /** Recommended height hint only (not enforced). */
  targetH?: number;
  /** Unused; kept for call-site compatibility. */
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', await downscaleImage(file)); // cap at 2000px to avoid OOM in the designer
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        let msg = res.status === 413 ? 'Image too large — try a smaller file' : 'Upload failed';
        try { const d = await res.json(); msg = d.error ?? msg; } catch { /* non-JSON error body */ }
        throw new Error(msg);
      }
      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      setError('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <LinkIcon className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 outline-none font-medium text-gray-900"
          placeholder="Paste an image URL, or upload below"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          {uploading ? 'Uploading…' : 'Upload Image'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>

        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Preview"
            className="h-20 w-auto object-contain rounded-lg border border-gray-200 bg-gray-50"
            onLoad={(e) => setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
          />
        )}
        <span className="text-xs text-gray-400 font-medium">
          {dims
            ? `${dims.w}×${dims.h} (original kept)`
            : targetW && targetH
              ? `Recommended ${targetW}×${targetH} — original size kept`
              : 'Original size kept'}
        </span>
      </div>

      {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
    </div>
  );
}
