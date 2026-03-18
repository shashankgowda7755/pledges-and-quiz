"use client";
import React, { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';

interface Props {
  userName:      string;
  bgImageUrl:    string;
  userPhotoUrl?: string | null;
  width?:        number;
  // kept for API compatibility — no longer used for rendering
  pledgeName?:   string;
  date?:         string;
  orgLogoUrl?:   string | null;
  logoPosition?: string | null;
  isQuiz?:       boolean;
  layout?:       string;
}

export const PledgePosterCanvas = forwardRef<HTMLCanvasElement, Props>(
  ({ userName, bgImageUrl, userPhotoUrl, width = 1080 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useImperativeHandle(ref, () => canvasRef.current!);

    const draw = useCallback(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const scale = width / 1080;
      const h     = Math.round(1350 * scale);
      canvas.width  = width;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      // 1. Background poster (full bleed)
      try {
        const bg = await loadImage(bgImageUrl);
        ctx.drawImage(bg, 0, 0, width, h);
      } catch {
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, width, h);
      }

      // 2. Photo — rectangle slot matched to the white placeholder on the poster
      // Base dimensions from the design (2500x3536 approx based on the coordinates provided)
      const baseW = 2500;
      const baseH = 3536;
      
      // Coordinates provided by user:
      // Width: 998 px, Height: 1014.1 px
      // X: 1321.2 px, Y: 720.3 px
      // Rotate: -10.2 degrees
      
      const rx = (1321.2 / baseW) * width;
      const ry = (720.3 / baseH) * h;
      const rw = (998 / baseW) * width;
      const rh = (1014.1 / baseH) * h;
      const angle = -10.2 * (Math.PI / 180);

      if (userPhotoUrl) {
        try {
          const photo = await loadImage(userPhotoUrl);
          ctx.save();
          
          // Move to center of the photo area to apply rotation
          ctx.translate(rx + rw/2, ry + rh/2);
          ctx.rotate(angle);
          ctx.translate(-(rx + rw/2), -(ry + rh/2));
          
          ctx.beginPath();
          ctx.rect(rx, ry, rw, rh);
          ctx.clip();
          // cover-fill: scale photo to fill the rect without distortion
          const s  = Math.max(rw / photo.width, rh / photo.height);
          const pw = photo.width * s;
          const ph = photo.height * s;
          ctx.drawImage(photo, rx + (rw - pw) / 2, ry + (rh - ph) / 2, pw, ph);
          ctx.restore();
        } catch { /* skip */ }
      }

      // 3. Name — below the photo, centred on the slot
      if (userName) {
        const fontMontserrat = getComputedStyle(document.documentElement)
          .getPropertyValue('--font-montserrat') || 'Montserrat';

        // Base coordinate for name from new provided box:
        // X: 992.4, Y: 1950.4, Width: 1345.9, Height: 185.1
        const nameXBase = 992.4 + (1345.9 / 2);
        const nameYBase = 1950.4 + (185.1 / 2);
        
        const nameX = (nameXBase / baseW) * width;
        const nameY = (nameYBase / baseH) * h;

        const maxLen = Math.max(1, userName.length);
        const fs     = (maxLen > 18 ? 50 : maxLen > 12 ? 65 : 80) * scale;
        const nameMaxW = (1345.9 / baseW) * width;
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur  = 0;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        ctx.font        = `700 ${fs}px ${fontMontserrat}, sans-serif`;
        ctx.fillStyle   = '#1a2744';
        
        ctx.fillText(userName, nameX, nameY, nameMaxW);
      }

      // 4. Subtle watermark
      const fontInter = getComputedStyle(document.documentElement)
        .getPropertyValue('--font-inter') || 'Inter';
      ctx.font      = `500 ${15 * scale}px ${fontInter}, sans-serif`;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.textAlign = 'right';
      ctx.shadowBlur = 0;
      ctx.fillText('pledgemarks.com', width - 20 * scale, h - 16 * scale);

    }, [userName, bgImageUrl, userPhotoUrl, width]);

    useEffect(() => { draw(); }, [draw]);

    return <canvas ref={canvasRef} style={{ width: '100%', borderRadius: 12, display: 'block' }} />;
  }
);
PledgePosterCanvas.displayName = 'PledgePosterCanvas';

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
