'use client';

import { useRef, useState, useEffect } from 'react';
import {
  Plus, Trash2, Type, ImageIcon, User, Loader2, TextCursorInput,
  AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
} from 'lucide-react';
import { PledgePosterCanvas } from '@/components/PledgePosterCanvas';
import type { CertConfig, CertNameBox, CertPhotoBox, CertImage, CertTextBox } from '@/components/PledgePosterCanvas';
import { downscaleImage } from '@/lib/downscaleImage';

// Built-in placeholder face so the photo slot previews a real crop even before
// the admin uploads a sample. Preview-only — never saved to a participant.
const DEFAULT_FACE = '/images/test-face.jpg';

// Coordinates live in the background image's own pixel space, so they stay
// correct whatever poster size is uploaded. These are starting fallbacks until
// the real image's natural size loads.
const FALLBACK_W = 1080;
const FALLBACK_H = 1350;

const makeDefaultName = (w: number, h: number): CertNameBox => ({
  x: Math.round(w / 2), y: Math.round(h * 0.74), fontSize: Math.round(w * 0.06),
  color: '#1a2744', align: 'center', maxW: Math.round(w * 0.75),
});
const makeDefaultPhoto = (w: number, h: number): CertPhotoBox => ({
  x: Math.round(w * 0.36), y: Math.round(h * 0.22),
  w: Math.round(w * 0.28), h: Math.round(w * 0.35), angle: 0,
});
const makeDefaultText = (w: number, h: number): CertTextBox => ({
  id: `txt-${Date.now()}-${Math.round(Math.random() * 1e4)}`,
  text: 'Your text', x: Math.round(w / 2), y: Math.round(h * 0.6),
  fontSize: Math.round(w * 0.04), color: '#1a2744', align: 'center',
  maxW: Math.round(w * 0.7), weight: 700, italic: false,
});

type DragKind =
  | { kind: 'name-move' }
  | { kind: 'name-resize' }
  | { kind: 'photo-move' }
  | { kind: 'photo-resize' }
  | { kind: 'text-move'; index: number }
  | { kind: 'text-resize'; index: number }
  | { kind: 'image-move'; index: number }
  | { kind: 'image-resize'; index: number };

type Sel =
  | { t: 'name' }
  | { t: 'photo' }
  | { t: 'text'; i: number }
  | { t: 'image'; i: number }
  | null;

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
  const imgFileRef = useRef<HTMLInputElement>(null);
  const photoFileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingSample, setUploadingSample] = useState(false);
  const [imgAspect, setImgAspect] = useState<Record<string, number>>({});
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: FALLBACK_W, h: FALLBACK_H });
  const [sel, setSel] = useState<Sel>(null);
  const [sampleName, setSampleName] = useState('PARTICIPANT NAME');
  const [samplePhoto, setSamplePhoto] = useState<string | null>(null);

  const RW = dims.w;
  const RH = dims.h;

  const name = value.name ?? null;
  const photo = value.photo ?? null;
  const images = value.images ?? [];
  const texts = value.texts ?? [];

  // Read the bg's natural size to set the coordinate space (the canvas uses the
  // same), so overlay handles line up exactly with what's drawn.
  useEffect(() => {
    if (!bgImageUrl) return;
    const img = new Image();
    img.onload = () => { if (img.naturalWidth && img.naturalHeight) setDims({ w: img.naturalWidth, h: img.naturalHeight }); };
    img.src = bgImageUrl.startsWith('/') ? `${window.location.origin}${bgImageUrl}` : bgImageUrl;
  }, [bgImageUrl]);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const getScale = () => (containerRef.current ? containerRef.current.clientWidth / RW : 1);

  const pctBox = (x: number, y: number, w: number, h: number) => ({
    left: `${(x / RW) * 100}%`, top: `${(y / RH) * 100}%`,
    width: `${(w / RW) * 100}%`, height: `${(h / RH) * 100}%`,
  });

  const targetWH = (s: NonNullable<Sel>): { w: number; h: number } => {
    if (s.t === 'name' && name) return { w: name.maxW, h: name.fontSize };
    if (s.t === 'photo' && photo) return { w: photo.w, h: photo.h };
    if (s.t === 'text') { const t = texts[s.i]; return { w: t?.maxW ?? 0, h: t?.fontSize ?? 0 }; }
    if (s.t === 'image') { const im = images[s.i]; return { w: im?.w ?? 0, h: (im?.w ?? 0) * (imgAspect[im?.url ?? ''] ?? 0.4) }; }
    return { w: 0, h: 0 };
  };

  const patchText = (i: number, p: Partial<CertTextBox>) =>
    onChange({ ...value, texts: texts.map((t, k) => k === i ? { ...t, ...p } : t) });

  const setX = (s: NonNullable<Sel>, x: number) => {
    if (s.t === 'name' && name) onChange({ ...value, name: { ...name, x: clamp(Math.round(x), 0, RW) } });
    else if (s.t === 'photo' && photo) onChange({ ...value, photo: { ...photo, x: clamp(Math.round(x), 0, RW - photo.w) } });
    else if (s.t === 'text') patchText(s.i, { x: clamp(Math.round(x), 0, RW) });
    else if (s.t === 'image') onChange({ ...value, images: images.map((im, k) => k === s.i ? { ...im, x: clamp(Math.round(x), 0, RW) } : im) });
  };
  const setY = (s: NonNullable<Sel>, y: number) => {
    if (s.t === 'name' && name) onChange({ ...value, name: { ...name, y: clamp(Math.round(y), 0, RH) } });
    else if (s.t === 'photo' && photo) onChange({ ...value, photo: { ...photo, y: clamp(Math.round(y), 0, RH - photo.h) } });
    else if (s.t === 'text') patchText(s.i, { y: clamp(Math.round(y), 0, RH) });
    else if (s.t === 'image') onChange({ ...value, images: images.map((im, k) => k === s.i ? { ...im, y: clamp(Math.round(y), 0, RH) } : im) });
  };
  const getXY = (s: NonNullable<Sel>): { x: number; y: number } => {
    if (s.t === 'name' && name) return { x: name.x, y: name.y };
    if (s.t === 'photo' && photo) return { x: photo.x, y: photo.y };
    if (s.t === 'text') { const t = texts[s.i]; return { x: t?.x ?? 0, y: t?.y ?? 0 }; }
    if (s.t === 'image') { const im = images[s.i]; return { x: im?.x ?? 0, y: im?.y ?? 0 }; }
    return { x: 0, y: 0 };
  };

  // text & name share the same anchor semantics (x = align anchor)
  const alignH = (s: NonNullable<Sel>, pos: 'left' | 'center' | 'right') => {
    const { w } = targetWH(s);
    if (s.t === 'name' && name) {
      const x = pos === 'left' ? 0 : pos === 'center' ? Math.round(RW / 2) : RW;
      onChange({ ...value, name: { ...name, align: pos, x } });
    } else if (s.t === 'text') {
      const x = pos === 'left' ? 0 : pos === 'center' ? Math.round(RW / 2) : RW;
      patchText(s.i, { align: pos, x });
    } else {
      const x = pos === 'left' ? 0 : pos === 'center' ? Math.round((RW - w) / 2) : RW - w;
      setX(s, x);
    }
  };
  const alignV = (s: NonNullable<Sel>, pos: 'top' | 'middle' | 'bottom') => {
    const { h } = targetWH(s);
    if (s.t === 'name' || s.t === 'text') {
      const y = pos === 'top' ? Math.round(h / 2) : pos === 'middle' ? Math.round(RH / 2) : Math.round(RH - h / 2);
      setY(s, y);
    } else {
      const y = pos === 'top' ? 0 : pos === 'middle' ? Math.round((RH - h) / 2) : RH - h;
      setY(s, y);
    }
  };

  // arrow-key nudge on the selected element
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!sel) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const step = e.shiftKey ? 10 : 1;
      let dx = 0, dy = 0;
      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else return;
      e.preventDefault();
      const { x, y } = getXY(sel);
      if (dx) setX(sel, x + dx);
      if (dy) setY(sel, y + dy);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, value, RW, RH, imgAspect]);

  // drag engine
  const startDrag = (e: React.MouseEvent, drag: DragKind) => {
    e.preventDefault();
    e.stopPropagation();
    if (drag.kind.startsWith('name')) setSel({ t: 'name' });
    else if (drag.kind.startsWith('photo')) setSel({ t: 'photo' });
    else if (drag.kind.startsWith('text') && 'index' in drag) setSel({ t: 'text', i: drag.index });
    else if (drag.kind.startsWith('image') && 'index' in drag) setSel({ t: 'image', i: drag.index });

    const scale = getScale();
    const startX = e.clientX;
    const startY = e.clientY;
    const snapName = name ? { ...name } : null;
    const snapPhoto = photo ? { ...photo } : null;
    const snapTexts = texts.map(t => ({ ...t }));
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
        if (snapPhoto.shape === 'circle') {
          const d = clamp(snapPhoto.w + dx, 60, Math.min(RW - snapPhoto.x, RH - snapPhoto.y));
          onChange({ ...value, photo: { ...snapPhoto, w: d, h: d } });
        } else {
          onChange({ ...value, photo: { ...snapPhoto, w: clamp(snapPhoto.w + dx, 60, RW - snapPhoto.x), h: clamp(snapPhoto.h + dy, 60, RH - snapPhoto.y) } });
        }
      } else if (drag.kind === 'text-move') {
        const i = drag.index;
        onChange({ ...value, texts: snapTexts.map((t, k) => k === i ? { ...t, x: clamp(t.x + dx, 0, RW), y: clamp(t.y + dy, 0, RH) } : t) });
      } else if (drag.kind === 'text-resize') {
        const i = drag.index;
        onChange({ ...value, texts: snapTexts.map((t, k) => k === i ? { ...t, maxW: clamp(t.maxW + dx, 60, RW) } : t) });
      } else if (drag.kind === 'image-move') {
        const i = drag.index;
        onChange({ ...value, images: snapImages.map((im, k) => k === i ? { ...im, x: clamp(im.x + dx, 0, RW), y: clamp(im.y + dy, 0, RH) } : im) });
      } else if (drag.kind === 'image-resize') {
        const i = drag.index;
        onChange({ ...value, images: snapImages.map((im, k) => k === i ? { ...im, w: clamp(im.w + dx, 30, RW) } : im) });
      }
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // toggles + mutators
  const toggleName = () => { onChange({ ...value, name: name ? null : makeDefaultName(RW, RH) }); setSel(name ? null : { t: 'name' }); };
  const togglePhoto = () => { onChange({ ...value, photo: photo ? null : makeDefaultPhoto(RW, RH) }); setSel(photo ? null : { t: 'photo' }); };
  const patchName = (p: Partial<CertNameBox>) => name && onChange({ ...value, name: { ...name, ...p } });
  const patchPhoto = (p: Partial<CertPhotoBox>) => photo && onChange({ ...value, photo: { ...photo, ...p } });
  const patchImage = (i: number, p: Partial<CertImage>) => onChange({ ...value, images: images.map((im, k) => k === i ? { ...im, ...p } : im) });
  const removeImage = (i: number) => { onChange({ ...value, images: images.filter((_, k) => k !== i) }); setSel(null); };
  const addText = () => { onChange({ ...value, texts: [...texts, makeDefaultText(RW, RH)] }); setSel({ t: 'text', i: texts.length }); };
  const removeText = (i: number) => { onChange({ ...value, texts: texts.filter((_, k) => k !== i) }); setSel(null); };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', await downscaleImage(file));
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        const newImg: CertImage = { url: data.url, x: Math.round(RW * 0.09), y: Math.round(RH * 0.85), w: Math.round(RW * 0.19) };
        onChange({ ...value, images: [...images, newImg] });
        setSel({ t: 'image', i: images.length });
      }
    } finally {
      setUploading(false);
    }
  };

  // Sample photo is preview-only: read it locally, never upload/persist.
  const handleSamplePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingSample(true);
    try {
      const small = await downscaleImage(file);
      const reader = new FileReader();
      reader.onload = () => setSamplePhoto(reader.result as string);
      reader.readAsDataURL(small);
    } finally {
      setUploadingSample(false);
    }
  };

  if (!bgImageUrl) {
    return (
      <p className="text-sm text-gray-400 italic bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
        Upload a poster background above first — then place the name, photo, text, and logos on it.
      </p>
    );
  }

  const isSel = (s: NonNullable<Sel>) => !!sel && JSON.stringify(sel) === JSON.stringify(s);
  const previewPhoto = samplePhoto ?? DEFAULT_FACE;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] gap-6">
      {/* ── LIVE preview: the real renderer + transparent drag handles ── */}
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 select-none">
        <div ref={containerRef} className="relative w-full" style={{ containerType: 'inline-size' }}>
          {/* The actual certificate renderer — what you see IS the output */}
          <PledgePosterCanvas
            layout="custom"
            cert={value}
            userName={name ? sampleName : ''}
            userPhotoUrl={photo ? previewPhoto : null}
            bgImageUrl={bgImageUrl}
            width={1080}
          />

          {/* Transparent overlay: selection outlines + move/resize handles */}
          <div className="absolute inset-0" onMouseDown={() => setSel(null)}>
            {/* Photo */}
            {photo && (
              <div
                style={{ position: 'absolute', ...pctBox(photo.x, photo.y, photo.w, photo.h), cursor: 'move', transform: photo.angle ? `rotate(${photo.angle}deg)` : undefined, outline: isSel({ t: 'photo' }) ? '2px solid #2563eb' : '1px dashed rgba(37,99,235,.6)', outlineOffset: 2, borderRadius: photo.shape === 'circle' ? '9999px' : 4 }}
                onMouseDown={(e) => startDrag(e, { kind: 'photo-move' })}
              >
                <Handle color="#3b82f6" onMouseDown={(e) => startDrag(e, { kind: 'photo-resize' })} />
              </div>
            )}

            {/* Name */}
            {name && (
              <div
                style={{ position: 'absolute', left: `${(name.x / RW) * 100}%`, top: `${(name.y / RH) * 100}%`, width: `${(name.maxW / RW) * 100}%`, height: `${(name.fontSize / RH) * 100}%`, transform: alignTransform(name.align), cursor: 'move', outline: isSel({ t: 'name' }) ? '2px solid #0d9488' : '1px dashed rgba(13,148,136,.6)', outlineOffset: 2, borderRadius: 4 }}
                onMouseDown={(e) => startDrag(e, { kind: 'name-move' })}
              >
                <Handle color="#14b8a6" onMouseDown={(e) => startDrag(e, { kind: 'name-resize' })} />
              </div>
            )}

            {/* Text blocks */}
            {texts.map((t, i) => (
              <div
                key={t.id}
                style={{ position: 'absolute', left: `${(t.x / RW) * 100}%`, top: `${(t.y / RH) * 100}%`, width: `${(t.maxW / RW) * 100}%`, height: `${(t.fontSize / RH) * 100}%`, transform: alignTransform(t.align), cursor: 'move', outline: isSel({ t: 'text', i }) ? '2px solid #7c3aed' : '1px dashed rgba(124,58,237,.6)', outlineOffset: 2, borderRadius: 4 }}
                onMouseDown={(e) => startDrag(e, { kind: 'text-move', index: i })}
              >
                <Handle color="#7c3aed" onMouseDown={(e) => startDrag(e, { kind: 'text-resize', index: i })} />
              </div>
            ))}

            {/* Overlay images */}
            {images.map((im, i) => {
              const aspect = imgAspect[im.url] ?? 0.4;
              return (
                <div key={im.url} style={{ position: 'absolute', ...pctBox(im.x, im.y, im.w, im.w * aspect), cursor: 'move', outline: isSel({ t: 'image', i }) ? '2px solid #d97706' : '1px dashed rgba(217,119,6,.6)', outlineOffset: 2, borderRadius: 4 }} onMouseDown={(e) => startDrag(e, { kind: 'image-move', index: i })}>
                  {/* hidden probe to read natural aspect for the handle box */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt="" className="hidden" onLoad={(e) => { const t = e.currentTarget; if (t.naturalWidth) setImgAspect(a => ({ ...a, [im.url]: t.naturalHeight / t.naturalWidth })); }} />
                  <Handle color="#f59e0b" onMouseDown={(e) => startDrag(e, { kind: 'image-resize', index: i })} />
                </div>
              );
            })}

            <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-2 py-1 rounded-full pointer-events-none">
              Live preview — drag to move · arrow keys nudge (⇧ = 10px)
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="space-y-5">
        {/* Preview sample inputs */}
        <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/60">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Preview sample (not saved)</p>
          <Field label="Name on certificate">
            <input value={sampleName} onChange={(e) => setSampleName(e.target.value)} className={inputCls} placeholder="PARTICIPANT NAME" />
          </Field>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => photoFileRef.current?.click()} disabled={uploadingSample} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              {uploadingSample ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <User className="w-3.5 h-3.5" />} Upload sample photo
            </button>
            {samplePhoto && <button type="button" onClick={() => setSamplePhoto(null)} className="text-xs font-semibold text-gray-400 hover:text-gray-700">Reset</button>}
            <input ref={photoFileRef} type="file" accept="image/*" className="hidden" onChange={handleSamplePhoto} />
          </div>
          <p className="text-[10px] text-gray-400">Default placeholder face shown until you upload one.</p>
        </div>

        {/* Name layer */}
        <div className="border border-gray-200 rounded-xl p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2 font-bold text-gray-800 text-sm"><Type className="w-4 h-4 text-teal-500" /> Participant Name</span>
            <input type="checkbox" checked={!!name} onChange={toggleName} className="w-4 h-4 accent-teal-500" />
          </label>
          {name && (
            <div className="mt-4 space-y-4">
              <PositionTools accent="#0d9488" selected={isSel({ t: 'name' })} onSelect={() => setSel({ t: 'name' })}
                x={name.x} y={name.y} onX={(v) => setX({ t: 'name' }, v)} onY={(v) => setY({ t: 'name' }, v)}
                onAlignH={(p) => alignH({ t: 'name' }, p)} onAlignV={(p) => alignV({ t: 'name' }, p)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Font size"><input type="number" min={12} max={400} value={name.fontSize} onChange={(e) => patchName({ fontSize: Number(e.target.value) })} className={inputCls} /></Field>
                <Field label="Color"><input type="color" value={name.color} onChange={(e) => patchName({ color: e.target.value })} className="h-10 w-full rounded-lg border border-gray-200 cursor-pointer" /></Field>
                <Field label="Align (text)">
                  <select value={name.align} onChange={(e) => patchName({ align: e.target.value as CertNameBox['align'] })} className={inputCls}>
                    <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
                  </select>
                </Field>
                <Field label="Max width"><input type="number" min={80} max={RW} value={name.maxW} onChange={(e) => patchName({ maxW: Number(e.target.value) })} className={inputCls} /></Field>
              </div>
            </div>
          )}
        </div>

        {/* Photo layer */}
        <div className="border border-gray-200 rounded-xl p-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2 font-bold text-gray-800 text-sm"><User className="w-4 h-4 text-blue-500" /> Photo Slot</span>
            <input type="checkbox" checked={!!photo} onChange={togglePhoto} className="w-4 h-4 accent-blue-500" />
          </label>
          {photo && (
            <div className="mt-4 space-y-4">
              <PositionTools accent="#2563eb" selected={isSel({ t: 'photo' })} onSelect={() => setSel({ t: 'photo' })}
                x={photo.x} y={photo.y} onX={(v) => setX({ t: 'photo' }, v)} onY={(v) => setY({ t: 'photo' }, v)}
                onAlignH={(p) => alignH({ t: 'photo' }, p)} onAlignV={(p) => alignV({ t: 'photo' }, p)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Shape">
                  <select value={photo.shape ?? 'rect'} onChange={(e) => { const shape = e.target.value as 'rect' | 'circle'; if (shape === 'circle') { const d = Math.min(photo.w, photo.h); patchPhoto({ shape, w: d, h: d, angle: 0 }); } else patchPhoto({ shape }); }} className={inputCls}>
                    <option value="rect">Rectangle / Square</option><option value="circle">Circle</option>
                  </select>
                </Field>
                <Field label="Rotation°"><input type="number" min={-45} max={45} disabled={photo.shape === 'circle'} value={photo.angle ?? 0} onChange={(e) => patchPhoto({ angle: Number(e.target.value) })} className={inputCls} /></Field>
                <Field label={photo.shape === 'circle' ? 'Diameter' : 'Width'}><input type="number" min={60} value={photo.w} onChange={(e) => { const w = Number(e.target.value); patchPhoto(photo.shape === 'circle' ? { w, h: w } : { w }); }} className={inputCls} /></Field>
                <Field label="Height"><input type="number" min={60} disabled={photo.shape === 'circle'} value={photo.h} onChange={(e) => patchPhoto({ h: Number(e.target.value) })} className={inputCls} /></Field>
              </div>
            </div>
          )}
        </div>

        {/* Text blocks */}
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 font-bold text-gray-800 text-sm"><TextCursorInput className="w-4 h-4 text-violet-500" /> Text Blocks</span>
            <button type="button" onClick={addText} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50">
              <Plus className="w-3.5 h-3.5" /> Add text
            </button>
          </div>
          {texts.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No custom text. Add titles, dates, or any static line.</p>
          ) : (
            <ul className="space-y-4">
              {texts.map((t, i) => (
                <li key={t.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <input value={t.text} onChange={(e) => patchText(i, { text: e.target.value })} className={`${inputCls} flex-1`} placeholder="Text…" onFocus={() => setSel({ t: 'text', i })} />
                    <button type="button" onClick={() => removeText(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <PositionTools accent="#7c3aed" selected={isSel({ t: 'text', i })} onSelect={() => setSel({ t: 'text', i })}
                    x={t.x} y={t.y} onX={(v) => setX({ t: 'text', i }, v)} onY={(v) => setY({ t: 'text', i }, v)}
                    onAlignH={(p) => alignH({ t: 'text', i }, p)} onAlignV={(p) => alignV({ t: 'text', i }, p)} />
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Field label="Font size"><input type="number" min={12} max={400} value={t.fontSize} onChange={(e) => patchText(i, { fontSize: Number(e.target.value) })} className={inputCls} /></Field>
                    <Field label="Color"><input type="color" value={t.color} onChange={(e) => patchText(i, { color: e.target.value })} className="h-10 w-full rounded-lg border border-gray-200 cursor-pointer" /></Field>
                    <Field label="Align"><select value={t.align} onChange={(e) => patchText(i, { align: e.target.value as CertTextBox['align'] })} className={inputCls}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></Field>
                    <Field label="Weight"><select value={t.weight ?? 700} onChange={(e) => patchText(i, { weight: Number(e.target.value) as 400 | 700 })} className={inputCls}><option value={400}>Regular</option><option value={700}>Bold</option></select></Field>
                    <Field label="Max width"><input type="number" min={60} max={RW} value={t.maxW} onChange={(e) => patchText(i, { maxW: Number(e.target.value) })} className={inputCls} /></Field>
                    <Field label="Italic"><label className="flex items-center gap-2 h-10"><input type="checkbox" checked={!!t.italic} onChange={(e) => patchText(i, { italic: e.target.checked })} className="w-4 h-4 accent-violet-500" /><span className="text-sm text-gray-600">Italic</span></label></Field>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Overlay images */}
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 font-bold text-gray-800 text-sm"><ImageIcon className="w-4 h-4 text-amber-500" /> Logos / Custom Images</span>
            <button type="button" onClick={() => imgFileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add
            </button>
            <input ref={imgFileRef} type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
          </div>
          {images.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No overlays. Add sponsor/partner logos.</p>
          ) : (
            <ul className="space-y-4">
              {images.map((im, i) => (
                <li key={im.url} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={im.url} alt="" className="h-8 w-8 object-contain rounded border border-gray-200 bg-white" />
                    <span className="text-xs font-bold text-gray-600 flex-1">Image {i + 1}</span>
                    <button type="button" onClick={() => removeImage(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <PositionTools accent="#d97706" selected={isSel({ t: 'image', i })} onSelect={() => setSel({ t: 'image', i })}
                    x={im.x} y={im.y} onX={(v) => setX({ t: 'image', i }, v)} onY={(v) => setY({ t: 'image', i }, v)}
                    onAlignH={(p) => alignH({ t: 'image', i }, p)} onAlignV={(p) => alignV({ t: 'image', i }, p)} />
                  <div className="mt-3 w-1/2">
                    <Field label="Width"><input type="number" min={30} max={RW} value={im.w} onChange={(e) => patchImage(i, { w: Number(e.target.value) })} className={inputCls} /></Field>
                  </div>
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
    <div onMouseDown={onMouseDown} style={{ position: 'absolute', right: -7, bottom: -7, width: 16, height: 16, background: color, border: '2px solid white', borderRadius: 4, cursor: 'se-resize', zIndex: 10 }} />
  );
}

function PositionTools({
  accent, selected, onSelect, x, y, onX, onY, onAlignH, onAlignV,
}: {
  accent: string; selected: boolean; onSelect: () => void;
  x: number; y: number; onX: (v: number) => void; onY: (v: number) => void;
  onAlignH: (p: 'left' | 'center' | 'right') => void; onAlignV: (p: 'top' | 'middle' | 'bottom') => void;
}) {
  const btn = 'flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors';
  return (
    <div onMouseDown={onSelect} className="rounded-lg p-3 transition-colors" style={{ background: selected ? `${accent}10` : '#f9fafb', border: `1px solid ${selected ? accent : '#f3f4f6'}` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Position</span>
        {selected && <span className="text-[10px] font-bold" style={{ color: accent }}>● selected — arrow keys nudge</span>}
      </div>
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <button type="button" title="Align left" className={btn} onClick={() => onAlignH('left')}><AlignHorizontalJustifyStart className="w-4 h-4" /></button>
        <button type="button" title="Center horizontally" className={btn} onClick={() => onAlignH('center')}><AlignHorizontalJustifyCenter className="w-4 h-4" /></button>
        <button type="button" title="Align right" className={btn} onClick={() => onAlignH('right')}><AlignHorizontalJustifyEnd className="w-4 h-4" /></button>
        <span className="w-px h-6 bg-gray-200 mx-1" />
        <button type="button" title="Align top" className={btn} onClick={() => onAlignV('top')}><AlignVerticalJustifyStart className="w-4 h-4" /></button>
        <button type="button" title="Center vertically" className={btn} onClick={() => onAlignV('middle')}><AlignVerticalJustifyCenter className="w-4 h-4" /></button>
        <button type="button" title="Align bottom" className={btn} onClick={() => onAlignV('bottom')}><AlignVerticalJustifyEnd className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block"><span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">X</span><input type="number" value={x} onFocus={onSelect} onChange={(e) => onX(Number(e.target.value))} className={inputCls} /></label>
        <label className="block"><span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Y</span><input type="number" value={y} onFocus={onSelect} onChange={(e) => onY(Number(e.target.value))} className={inputCls} /></label>
      </div>
    </div>
  );
}
