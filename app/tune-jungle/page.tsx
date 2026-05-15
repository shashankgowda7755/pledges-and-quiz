"use client";
import React, { useRef, useState } from 'react';
import { PledgePosterCanvas } from '@/components/PledgePosterCanvas';
import { downloadPoster } from '@/utils/downloadPoster';

const BG = '/images/quizzes/jungle-adventure-2026.jpg';

export default function TuneJunglePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [name, setName]         = useState('Aarav Kumar');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Jungle layout tuning (defaults match PledgePosterCanvas defaults)
  const [rectX, setRectX]             = useState(1465);
  const [rectY, setRectY]             = useState(1085);
  const [rectW, setRectW]             = useState(850);
  const [rectH, setRectH]             = useState(1010);
  const [rectAngleDeg, setRectAngle]  = useState(-13.5);
  const [nameOffsetY, setNameOffsetY] = useState(330);
  const [nameFontSize, setNameFontSize] = useState(72);
  const [nameRightX, setNameRightX]   = useState(2378);
  const [nameColor, setNameColor]     = useState('#1a4480');

  // Event Partner branding
  const [partnerLabelY, setPartnerLabelY]   = useState(3200);
  const [partnerLabelFs, setPartnerLabelFs] = useState(36);
  const [partnerLogoY, setPartnerLogoY]     = useState(3280);
  const [partnerLogoH, setPartnerLogoH]     = useState(180);

  const onPhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const tuning = {
    rectX, rectY, rectW, rectH, rectAngleDeg,
    nameOffsetY, nameFontSize, nameRightX, nameColor,
    partnerLabelY, partnerLabelFs, partnerLogoY, partnerLogoH,
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(tuning, null, 2));
  };

  const handleDownload = () => {
    if (canvasRef.current) downloadPoster(canvasRef.current, name || 'Preview', 'JungleAdventure');
  };

  const reset = () => {
    setRectX(1465); setRectY(1085); setRectW(850); setRectH(1010);
    setRectAngle(-13.5); setNameOffsetY(330); setNameFontSize(72); setNameRightX(2378); setNameColor('#1a4480');
    setPartnerLabelY(3200); setPartnerLabelFs(36); setPartnerLogoY(3280); setPartnerLogoH(180);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* Preview */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <h1 className="text-lg font-bold mb-3">Jungle Certificate — Live Tuner</h1>
          <PledgePosterCanvas
            ref={canvasRef}
            userName={name}
            bgImageUrl={BG}
            userPhotoUrl={photoUrl}
            layout="jungle"
            tuning={tuning}
            width={1080}
          />
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl p-4 shadow space-y-4 text-sm">
          <h2 className="font-bold text-base">Controls</h2>

          <label className="block">
            <span className="text-xs font-semibold text-gray-600 uppercase">Name on cert</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border rounded px-2 py-1.5"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-600 uppercase">Test photo</span>
            <input type="file" accept="image/*" onChange={onPhotoPick} className="mt-1 w-full text-xs" />
          </label>

          <Slider label="Rect X (left)"     value={rectX}        min={0}    max={2480} step={5}   onChange={setRectX} />
          <Slider label="Rect Y (top)"      value={rectY}        min={0}    max={3508} step={5}   onChange={setRectY} />
          <Slider label="Rect W (width)"    value={rectW}        min={100}  max={2000} step={5}   onChange={setRectW} />
          <Slider label="Rect H (height)"   value={rectH}        min={100}  max={2000} step={5}   onChange={setRectH} />
          <Slider label="Rotation (deg)"    value={rectAngleDeg} min={-15}  max={15}   step={0.5} onChange={setRectAngle} />
          <Slider label="Name offset Y"     value={nameOffsetY}  min={20}   max={500}  step={5}   onChange={setNameOffsetY} />
          <Slider label="Name right X"      value={nameRightX}   min={1500} max={2480} step={2}   onChange={setNameRightX} />
          <Slider label="Name font size"    value={nameFontSize} min={20}   max={200}  step={2}   onChange={setNameFontSize} />

          <div className="pt-2 mt-2 border-t">
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">Event Partner</div>
            <Slider label="Label Y"        value={partnerLabelY}  min={2900} max={3450} step={5} onChange={setPartnerLabelY} />
            <Slider label="Label size"     value={partnerLabelFs} min={16}   max={80}   step={1} onChange={setPartnerLabelFs} />
            <Slider label="Logo Y"         value={partnerLogoY}   min={2950} max={3500} step={5} onChange={setPartnerLogoY} />
            <Slider label="Logo height"    value={partnerLogoH}   min={60}   max={400}  step={2} onChange={setPartnerLogoH} />
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-gray-600 uppercase">Name color</span>
            <div className="flex items-center gap-2 mt-1">
              <input type="color" value={nameColor} onChange={(e) => setNameColor(e.target.value)} className="h-9 w-12 border rounded" />
              <input value={nameColor} onChange={(e) => setNameColor(e.target.value)} className="flex-1 border rounded px-2 py-1.5 font-mono text-xs" />
            </div>
          </label>

          <div className="flex flex-col gap-2 pt-2 border-t">
            <button onClick={handleDownload} className="bg-indigo-700 text-white rounded py-2 font-semibold hover:bg-indigo-800">
              ⬇ Download PNG
            </button>
            <button onClick={copyJson} className="bg-gray-900 text-white rounded py-2 font-semibold hover:bg-black">
              📋 Copy tuning JSON
            </button>
            <button onClick={reset} className="border rounded py-2 font-semibold hover:bg-gray-50">
              ↺ Reset to defaults
            </button>
          </div>

          <pre className="bg-gray-50 border rounded p-2 text-[10px] overflow-x-auto">{JSON.stringify(tuning, null, 2)}</pre>
        </div>

      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-600 uppercase">{label}</span>
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 text-right border rounded px-1 py-0.5 text-xs"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-1"
      />
    </label>
  );
}
