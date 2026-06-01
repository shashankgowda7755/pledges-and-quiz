'use client';

import { useRef, useState } from 'react';
import { Plus, Trash2, Type, ImageIcon, User, Loader2 } from 'lucide-react';
import type { CertConfig, CertNameBox, CertPhotoBox, CertImage } from '@/components/PledgePosterCanvas';

// Placement is stored in the background image's own pixel space, so coordinates
// stay correct whatever size the user uploads. These are only the starting
// fallback until the real image loads.
const FALLBACK_W = 1080;
const FALLBACK_H = 1350;

// Defaults are derived from the actual image dimensions when a box is enabled.
const makeDefaultName = (w: number, h: number): CertNameBox => ({
  x: Math.round(w / 2), y: Math.round(h * 0.74), fontSize: Math.round(w * 0.06),
  color: '#1a2744', align: 'center', maxW: Math.round(w * 0.75),
});
const makeDefaultPhoto = (w: number, h: number): CertPhotoBox => ({
  x: Math.round(w * 0.36), y: Math.round(h * 0.22),
  w: Math.round(w * 0.28), h: Math.round(w * 0.35), angle: 0,
});

type DragKind =
  | { kind: 'name-move' }
  | { kind: 'name-resize' }
  | { kind: 'photo-move' }
  | { kind: 'photo-resize' }
  | { kind: 'image-move'; index: number }
  | { kind: 'image-resize'; index: number };

export default function CertificateDesigner({
  bgImageUrl,
  value,
  onChange,
}: {
  bgImageUrl: string;
  value: CertConfig;
  onChange: (c: CertConfig) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imgAspect, setImgAspect] = useState<Record<number, number>>({}); // index -> h/w
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: FALLBACK_W, h: FALLBACK_H });

  const RW = dims.w;
  const RH = dims.h;

  const name = value.name ?? null;
  const photo = value.photo ?? null;
  const images = value.images ?? [];

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const getScale = () => (containerRef.current ? containerRef.current.clientWidth / RW : 1);

  const pctBox = (x: number, y: number, w: number, h: number) => ({
    left: `${(x / RW) * 100}%`,
    top: `${(y / RH) * 100}%`,
    width: `${(w / RW) * 100}%`,
    height: `${(h / RH) * 100}%`,
  });

  // ── drag engine ─────────────────────────────────────────────
  const startDrag = (e: React.MouseEvent, drag: DragKind) => {
    e.preventDefault();
    e.stopPropagation();
    const scale = getScale();
    const startX = e.clientX;
    const startY = e.clientY;
    const snapName = name ? { ...name } : null;
    const snapPhoto = photo ? { ...photo } : null;
    const snapImages = images.map(i => ({ ...i }));

    const onMove = (ev: MouseEvent) => {
      const dx = Math.round((ev.clientX - startX) / scale);
      const dy = Math.round((ev.clientY - startY) / scale);

      if (drag.kind === 'name-move' && snapName) {
        onChange({ ...value, name: { ...snapName, x: clamp(snapName.x + dx, 0, RW), y: clamp(snapName.y + dy, 0, RH) } });
      } else if (drag.kind === 'name-resize' && snapName) {
        onChange({ ...value, name: { ...snapName, maxW: clamp(snapName.maxW + dx, 80, RW) } });
      } else if (drag.kind === 'photo-move' && snapPhoto) {
        onChange({ ...value, photo: { ...snapPhoto, x: clamp(snapPhoto.x + dx, 0, RW - snapPhoto.w), y: clamp(snapPhoto.y + dy, 0, RH - snapPhoto.h) } });
      } else if (drag.kind === 'photo-resize' && snapPhoto) {
        onChange({ ...value, photo: { ...snapPhoto, w: clamp(snapPhoto.w + dx, 60, RW - snapPhoto.x), h: clamp(snapPhoto.h + dy, 60, RH - snapPhoto.y) } });
      } else if (drag.kind === 'image-move') {
        const i = drag.index;
        const next = snapImages.map((im, k) => k === i ? { ...im, x: clamp(im.x + dx, 0, RW), y: clamp(im.y + dy, 0, RH) } : im);
        onChange({ ...value, images: next });
      } else if (drag.kind === 'image-resize') {
        const i = drag.index;
        const next = snapImages.map((im, k) => k === i ? { ...im, w: clamp(im.w + dx, 30, RW) } : im);
        onChange({ ...value, images: next });
      }
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ── toggles + mutators ──────────────────────────────────────
  const toggleName = () => onChange({ ...value, name: name ? null : makeDefaultName(RW, RH) });
  const togglePhoto = () => onChange({ ...value, photo: photo ? null : makeDefaultPhoto(RW, RH) });
  const patchName = (p: Partial<CertNameBox>) => name && onChange({ ...value, name: { ...name, ...p } });
  const patchPhoto = (p: Partial<CertPhotoBox>) => photo && onChange({ ...value, photo: { ...photo, ...p } });
  const removeImage = (i: number) => onChange({ ...value, images: images.filter((_, k) => k !== i) });

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        const newImg: CertImage = { url: data.url, x: Math.round(RW * 0.09), y: Math.round(RH * 0.85), w: Math.round(RW * 0.19) };
        onChange({ ...value, images: [...images, newImg] });
      }
    } finally {
      setUploading(false);
    }
  };

  if (!bgImageUrl) {
    return (
      <p className="text-sm text-gray-400 italic bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
        Upload a poster background above first — then place the name, photo, and logos on it.
      </p>
    );
  }

  const sampleName = 'PARTICIPANT NAME';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_1fr] gap-6">
      {/* ── Canvas preview with draggable boxes ── */}
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 select-none">
        <div ref={containerRef} className="relative w-full" style={{ paddingBottom: `${(RH / RW) * 100}%`, containerType: 'inline-size' }}>
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bgImageUrl}
              alt="Poster"
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
              onLoad={(e) => {
                const t = e.currentTarget;
                if (t.naturalWidth && t.naturalHeight) setDims({ w: t.naturalWidth, h: t.naturalHeight });
              }}
            />

            {/* Photo box */}
            {photo && (
              <div style={{ position: 'absolute', ...pctBox(photo.x, photo.y, photo.w, photo.h), cursor: 'move' }} onMouseDown={(e) => startDrag(e, { kind: 'photo-move' })}>
                <div className="absolute inset-0 bg-blue-400/20 border-2 border-blue-500 rounded flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <Handle color="#3b82f6" onMouseDown={(e) => startDrag(e, { kind: 'photo-resize' })} />
              </div>
            )}

            {/* Name box */}
            {name && (
              <div
                style={{ position: 'absolute', left: `${(name.x / RW) * 100}%`, top: `${(name.y / RH) * 100}%`, width: `${(name.maxW / RW) * 100}%`, transform: alignTransform(name.align), cursor: 'move' }}
                onMouseDown={(e) => startDrag(e, { kind: 'name-move' })}
              >
                <div
                  className="border-2 border-teal-500 bg-teal-400/10 rounded px-1 whitespace-nowrap overflow-hidden"
                  style={{ textAlign: name.align, color: name.color, fontWeight: 700, fontSize: `clamp(8px, ${(name.fontSize / RW) * 100}cqw, 200px)`, lineHeight: 1.1 }}
                >
                  {sampleName}
                </div>
                <Handle color="#14b8a6" onMouseDown={(e) => startDrag(e, { kind: 'name-resize' })} />
              </div>
            )}

            {/* Overlay images */}
            {images.map((im, i) => {
              const aspect = imgAspect[i] ?? 0.4;
              return (
                <div key={i} style={{ position: 'absolute', ...pctBox(im.x, im.y, im.w, im.w * aspect), cursor: 'move' }} onMouseDown={(e) => startDrag(e, { kind: 'image-move', index: i })}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={im.url}
                    alt={`Overlay ${i + 1}`}
                    className="w-full pointer-events-none"
                    draggable={false}
                    onLoad={(e) => { const t = e.currentTarget; if (t.naturalWidth) setImgAspect(a => ({ ...a, [i]: t.naturalHeight / t.naturalWidth })); }}
                  />
                  <div className="absolute inset-0 border-2 border-amber-400 rounded pointer-events-none" />
                  <Handle color="#f59e0b" onMouseDown={(e) => startDrag(e, { kind: 'image-resize', index: i })} />
                </div>
              );
            })}

            <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-2 py-1 rounded-full pointer-events-none">
              Drag to move · corner to resize
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="space-y-5">
        {/* Name */}
        <div className="border border-gray-200 rounded-xl p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2 font-bold text-gray-800 text-sm"><Type className="w-4 h-4 text-teal-500" /> Participant Name</span>
            <input type="checkbox" checked={!!name} onChange={toggleName} className="w-4 h-4 accent-teal-500" />
          </label>
          {name && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Font size">
                <input type="number" min={12} max={200} value={name.fontSize} onChange={(e) => patchName({ fontSize: Number(e.target.value) })} className={inputCls} />
              </Field>
              <Field label="Color">
                <input type="color" value={name.color} onChange={(e) => patchName({ color: e.target.value })} className="h-10 w-full rounded-lg border border-gray-200 cursor-pointer" />
              </Field>
              <Field label="Align">
                <select value={name.align} onChange={(e) => patchName({ align: e.target.value as CertNameBox['align'] })} className={inputCls}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </Field>
              <Field label="Max width">
                <input type="number" min={80} max={RW} value={name.maxW} onChange={(e) => patchName({ maxW: Number(e.target.value) })} className={inputCls} />
              </Field>
              <div className="col-span-2 text-[11px] text-gray-400 font-mono">x: {name.x} · y: {name.y}</div>
            </div>
          )}
        </div>

        {/* Photo */}
        <div className="border border-gray-200 rounded-xl p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2 font-bold text-gray-800 text-sm"><User className="w-4 h-4 text-blue-500" /> Photo Slot</span>
            <input type="checkbox" checked={!!photo} onChange={togglePhoto} className="w-4 h-4 accent-blue-500" />
          </label>
          {photo && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Width"><input type="number" min={60} value={photo.w} onChange={(e) => patchPhoto({ w: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="Height"><input type="number" min={60} value={photo.h} onChange={(e) => patchPhoto({ h: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="Rotation°"><input type="number" min={-45} max={45} value={photo.angle ?? 0} onChange={(e) => patchPhoto({ angle: Number(e.target.value) })} className={inputCls} /></Field>
              <div className="col-span-2 text-[11px] text-gray-400 font-mono">x: {photo.x} · y: {photo.y}</div>
            </div>
          )}
        </div>

        {/* Overlay images */}
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 font-bold text-gray-800 text-sm"><ImageIcon className="w-4 h-4 text-amber-500" /> Logos / Custom Images</span>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
          </div>
          {images.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No overlays. Add sponsor/partner logos.</p>
          ) : (
            <ul className="space-y-2">
              {images.map((im, i) => (
                <li key={i} className="flex items-center gap-3 text-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt="" className="h-8 w-8 object-contain rounded border border-gray-200 bg-white" />
                  <span className="font-mono text-gray-400 flex-1">x:{im.x} y:{im.y} w:{im.w}</span>
                  <button type="button" onClick={() => removeImage(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-teal-400 outline-none font-medium text-gray-900';

function alignTransform(align: CertNameBox['align']) {
  if (align === 'center') return 'translate(-50%, -50%)';
  if (align === 'right') return 'translate(-100%, -50%)';
  return 'translate(0, -50%)';
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
      {children}
    </label>
  );
}

function Handle({ color, onMouseDown }: { color: string; onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{ position: 'absolute', right: -7, bottom: -7, width: 16, height: 16, background: color, border: '2px solid white', borderRadius: 4, cursor: 'se-resize', zIndex: 10 }}
    />
  );
}
