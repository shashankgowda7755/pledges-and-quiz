'use client';

import { useRef, useState } from 'react';

const REAL_W = 1080;
const REAL_H = 1350;

export interface LogoPos { x: number; y: number; w: number }

interface Props {
  posterUrl: string;
  logoUrl: string;
  position: LogoPos;
  onChange: (pos: LogoPos) => void;
}

export default function LogoPositionEditor({ posterUrl, logoUrl, position, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [logoAspect, setLogoAspect] = useState(1); // height / width ratio

  // All positions stored in REAL (1080×1350) space.
  // Display uses percentage so it scales automatically.
  const pct = {
    left: `${(position.x / REAL_W) * 100}%`,
    top: `${(position.y / REAL_H) * 100}%`,
    width: `${(position.w / REAL_W) * 100}%`,
  };

  const getScale = () => {
    if (!containerRef.current) return 1;
    return containerRef.current.clientWidth / REAL_W;
  };

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const startDrag = (e: React.MouseEvent, type: 'move' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();

    const scale = getScale();
    const startX = e.clientX;
    const startY = e.clientY;
    const snap = { ...position };

    const onMove = (ev: MouseEvent) => {
      const dxReal = Math.round((ev.clientX - startX) / scale);
      const dyReal = Math.round((ev.clientY - startY) / scale);

      if (type === 'move') {
        onChange({
          x: clamp(snap.x + dxReal, 0, REAL_W - snap.w),
          y: clamp(snap.y + dyReal, 0, REAL_H - Math.round(snap.w * logoAspect)),
          w: snap.w,
        });
      } else {
        const newW = clamp(snap.w + dxReal, 40, REAL_W - snap.x);
        onChange({ x: snap.x, y: snap.y, w: newW });
      }
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100" style={{ userSelect: 'none' }}>
      {/* Poster canvas — maintains 1080:1350 (4:5) aspect ratio */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ paddingBottom: `${(REAL_H / REAL_W) * 100}%` }}
      >
        <div className="absolute inset-0">
          {/* Poster background */}
          <img
            src={posterUrl}
            alt="Poster"
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          {/* Draggable logo */}
          <div
            style={{ position: 'absolute', ...pct, cursor: 'move' }}
            onMouseDown={(e) => startDrag(e, 'move')}
          >
            <img
              src={logoUrl}
              alt="Org logo"
              className="w-full block pointer-events-none select-none"
              draggable={false}
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth > 0) setLogoAspect(img.naturalHeight / img.naturalWidth);
              }}
            />
            {/* Teal border */}
            <div className="absolute inset-0 border-2 border-teal-400 rounded pointer-events-none" />

            {/* Resize handle — bottom-right corner */}
            <div
              style={{
                position: 'absolute',
                right: -6,
                bottom: -6,
                width: 14,
                height: 14,
                background: '#14b8a6',
                border: '2px solid white',
                borderRadius: 3,
                cursor: 'se-resize',
                zIndex: 10,
              }}
              onMouseDown={(e) => startDrag(e, 'resize')}
            />
          </div>

          {/* Hint label */}
          <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-2 py-1 rounded-full pointer-events-none">
            Drag to move · corner to resize
          </div>
        </div>
      </div>

      {/* Coordinate readout */}
      <div className="px-4 py-2 border-t border-gray-200 text-xs text-gray-500 font-mono flex gap-4">
        <span>x: {position.x}</span>
        <span>y: {position.y}</span>
        <span>w: {position.w}</span>
      </div>
    </div>
  );
}
