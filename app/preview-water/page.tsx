"use client";
import { useState, useRef } from 'react';
import { PledgePosterCanvas } from '@/components/PledgePosterCanvas';

export default function WaterPledgePreview() {
  const [name, setName] = useState('Hafiz Khan');
  const [photoUrl, setPhotoUrl] = useState<string | null>('/images/test-face.jpg');
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'water-pledge-preview.png'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 gap-6">
      <h1 className="text-2xl font-bold text-gray-800">Water Pledge — Poster Preview</h1>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Name on poster</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-400"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Upload Photo</label>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm font-semibold text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            {photoUrl ? '✓ Photo uploaded — click to change' : '+ Upload your photo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </div>

      {/* Hidden HD canvas for download */}
      {photoUrl && (
        <div className="hidden">
          <PledgePosterCanvas
            ref={canvasRef}
            userName={name}
            bgImageUrl="/images/pledges/water-pledge-poster.png"
            userPhotoUrl={photoUrl}
            width={1080}
            layout="water"
          />
        </div>
      )}

      <div className="w-full max-w-sm shadow-2xl rounded-2xl overflow-hidden bg-white">
        <PledgePosterCanvas
          userName={name}
          bgImageUrl="/images/pledges/water-pledge-poster.png"
          userPhotoUrl={photoUrl}
          width={800}
          layout="water"
        />
      </div>

      {photoUrl && (
        <button
          onClick={handleDownload}
          className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
        >
          ⬇ Download Full Resolution
        </button>
      )}
    </div>
  );
}
