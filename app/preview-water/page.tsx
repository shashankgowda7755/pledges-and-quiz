"use client";
import { useState, useRef } from 'react';
import { PledgePosterCanvas } from '@/components/PledgePosterCanvas';

const PRESET_POSTERS = [
  { label: 'Water Pledge', url: '/images/pledges/waterp.png' },
];

export default function WaterPledgePreview() {
  const [name, setName] = useState('Gowdaa, Shashank MS');
  const [photoUrl, setPhotoUrl] = useState<string | null>('/images/test-face.jpg');
  const [bgUrl, setBgUrl] = useState<string>('/images/pledges/waterp.png');
  const [bgLabel, setBgLabel] = useState<string>('Water Pledge');

  const fileRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Drop tuning (in 1080px canvas units)
  const [dropX, setDropX] = useState(221);
  const [dropY, setDropY] = useState(386);
  const [dropW, setDropW] = useState(358);
  const [dropH, setDropH] = useState(555);

  // Name tuning
  const [nameX, setNameX] = useState(719);
  const [nameY, setNameY] = useState(498);
  const [nameFontSize, setNameFontSize] = useState(68);
  const [letterSpacing, setLetterSpacing] = useState(4);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setBgUrl(ev.target?.result as string);
      setBgLabel(file.name.replace(/\.[^.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${bgLabel}-poster.png`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

  const tuning = { dropX, dropY, dropW, dropH, nameX, nameY, nameFontSize, letterSpacing };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row gap-0">

      {/* LEFT — Controls */}
      <div className="w-full lg:w-[340px] flex-shrink-0 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <h1 className="text-lg font-black text-gray-900 mb-1">Poster Tuner</h1>
        <p className="text-xs text-gray-400 mb-6">Upload any poster, adjust sliders, see live result.</p>

        {/* Poster Background */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Poster Background</label>

          {/* Presets */}
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_POSTERS.map(p => (
              <button key={p.url}
                onClick={() => { setBgUrl(p.url); setBgLabel(p.label); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${bgUrl === p.url ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Upload custom */}
          <button onClick={() => posterRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-gray-400 hover:border-purple-300 hover:text-purple-400 transition-colors">
            {bgUrl.startsWith('data:') ? `✓ ${bgLabel}` : '+ Upload custom poster'}
          </button>
          <input ref={posterRef} type="file" accept="image/*" className="hidden" onChange={handlePosterUpload} />
          {bgUrl.startsWith('data:') && (
            <p className="text-[10px] text-gray-400 mt-1 truncate">Custom: {bgLabel}</p>
          )}
        </div>

        <hr className="my-4 border-gray-100" />

        {/* Name */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Name on Poster</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-400" />
        </div>

        {/* Photo */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Person Photo</label>
          <button onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-gray-400 hover:border-blue-300 hover:text-blue-400 transition-colors">
            {photoUrl ? '✓ Change photo' : '+ Upload photo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        <hr className="my-5 border-gray-100" />

        {/* DROP CONTROLS */}
        <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-4">💧 Water Drop</p>

        {[
          { label: 'Drop X (left edge)', val: dropX, set: setDropX, min: 0, max: 600 },
          { label: 'Drop Y (top of tip)', val: dropY, set: setDropY, min: 0, max: 800 },
          { label: 'Drop Width', val: dropW, set: setDropW, min: 50, max: 700 },
          { label: 'Drop Height', val: dropH, set: setDropH, min: 100, max: 900 },
        ].map(({ label, val, set, min, max }) => (
          <div key={label} className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
              <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{val}</span>
            </div>
            <input type="range" min={min} max={max} value={val} onChange={e => set(Number(e.target.value))}
              className="w-full accent-blue-500" />
          </div>
        ))}

        <hr className="my-5 border-gray-100" />

        {/* NAME CONTROLS */}
        <p className="text-[11px] font-black text-orange-500 uppercase tracking-widest mb-4">✏️ Name</p>

        {[
          { label: 'Name X (left edge)', val: nameX, set: setNameX, min: 400, max: 1080 },
          { label: 'Name Y (vertical)', val: nameY, set: setNameY, min: 200, max: 900 },
          { label: 'Font Size (px)', val: nameFontSize, set: setNameFontSize, min: 20, max: 100 },
          { label: 'Letter Spacing (px)', val: letterSpacing, set: setLetterSpacing, min: 0, max: 30 },
        ].map(({ label, val, set, min, max }) => (
          <div key={label} className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
              <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{val}</span>
            </div>
            <input type="range" min={min} max={max} value={val} onChange={e => set(Number(e.target.value))}
              className="w-full accent-orange-500" />
          </div>
        ))}

        <hr className="my-5 border-gray-100" />

        {/* Copy values */}
        <div className="bg-gray-50 rounded-xl p-3 text-[10px] font-mono text-gray-500 mb-4 leading-relaxed">
          <p className="font-bold text-gray-700 mb-1">Copy these to PledgePosterCanvas.tsx:</p>
          <p>dropX: {dropX}</p>
          <p>dropY: {dropY}</p>
          <p>dropW: {dropW}</p>
          <p>dropH: {dropH}</p>
          <p>nameX: {nameX}</p>
          <p>nameY: {nameY}</p>
          <p>fontSize: {nameFontSize}</p>
          <p>letterSpacing: {letterSpacing}</p>
        </div>

        <button onClick={handleDownload}
          className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors text-sm">
          ⬇ Download PNG
        </button>
      </div>

      {/* RIGHT — Live Preview */}
      <div className="flex-1 flex items-start justify-center p-6 bg-gray-100">
        <div className="hidden">
          <PledgePosterCanvas ref={canvasRef} userName={name} bgImageUrl={bgUrl}
            userPhotoUrl={photoUrl} width={1080} layout="water" tuning={tuning} />
        </div>
        <div className="w-full max-w-sm shadow-2xl rounded-2xl overflow-hidden bg-white">
          <PledgePosterCanvas userName={name} bgImageUrl={bgUrl}
            userPhotoUrl={photoUrl} width={800} layout="water" tuning={tuning} />
        </div>
      </div>
    </div>
  );
}
