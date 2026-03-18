"use client";
import React, { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';

interface Props {
  userName:      string;
  pledgeName:    string;
  date:          string;
  bgImageUrl:    string;
  orgLogoUrl?:   string | null;
  userPhotoUrl?: string | null;
  logoPosition?: string | null;
  width?:        number;
  isQuiz?:       boolean;
  layout?:       'default' | 'sparrow'; // sparrow = custom poster with rect photo slot
}

export const PledgePosterCanvas = forwardRef<HTMLCanvasElement, Props>(
  ({ userName, pledgeName, date, bgImageUrl, orgLogoUrl, userPhotoUrl, logoPosition, width = 1080, isQuiz = false, layout = 'default' }, ref) => {
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

      // 1. Background
      try {
        const bg = await loadImage(bgImageUrl);
        ctx.drawImage(bg, 0, 0, width, h);
      } catch {
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, width, h);
      }

      // ─── SPARROW LAYOUT ─────────────────────────────────────────────────────
      if (layout === 'sparrow') {
        // White rectangle slot position (matched to the poster design)
        // These fractions place the photo inside the white placeholder card
        const rx = 0.535 * width;
        const ry = 0.195 * h;
        const rw = 0.375 * width;
        const rh = 0.365 * h;

        if (userPhotoUrl) {
          try {
            const photo = await loadImage(userPhotoUrl);
            ctx.save();
            // Clip to rectangle
            ctx.beginPath();
            ctx.rect(rx, ry, rw, rh);
            ctx.clip();
            // Cover fill
            const s = Math.max(rw / photo.width, rh / photo.height);
            const pw = photo.width * s;
            const ph = photo.height * s;
            ctx.drawImage(photo, rx + (rw - pw) / 2, ry + (rh - ph) / 2, pw, ph);
            ctx.restore();
          } catch { /* skip */ }
        } else {
          // Placeholder tint so the slot is visible
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fillRect(rx, ry, rw, rh);
        }

        // Name below the photo
        const fontMontserrat = getComputedStyle(document.documentElement).getPropertyValue('--font-montserrat') || 'Montserrat';
        const nameY = ry + rh + 38 * scale;
        const maxLen = Math.max(1, userName.length);
        const fs = (maxLen > 18 ? 32 : maxLen > 12 ? 40 : 48) * scale;

        ctx.textAlign   = 'center';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur  = 0;

        // Dark navy name (matches poster colour scheme)
        ctx.font      = `700 ${fs}px ${fontMontserrat}, sans-serif`;
        ctx.fillStyle = '#1a2744';
        ctx.fillText(userName || 'Your Name', rx + rw / 2, nameY, rw * 1.1);

        // Watermark
        const fontInter = getComputedStyle(document.documentElement).getPropertyValue('--font-inter') || 'Inter';
        ctx.font      = `500 ${16 * scale}px ${fontInter}, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'right';
        ctx.fillText('pledgemarks.com', width - 24 * scale, h - 20 * scale);
        return;
      }

      // ─── DEFAULT LAYOUT ──────────────────────────────────────────────────────

      // Dark vignette (bottom half)
      const grad = ctx.createLinearGradient(0, h * 0.5, 0, h);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.75)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, h);

      // Org logo
      if (orgLogoUrl && logoPosition) {
        try {
          const pos = JSON.parse(logoPosition);
          const logo = await loadImage(orgLogoUrl);
          ctx.drawImage(logo, pos.x * scale, pos.y * scale, pos.w * scale, pos.w * scale);
        } catch { /* skip */ }
      }

      // User photo (circle)
      if (userPhotoUrl) {
        try {
          const photo = await loadImage(userPhotoUrl);
          ctx.save();
          const cx = width / 2;
          const cy = isQuiz ? h * 0.42 : h * 0.50;
          const r  = isQuiz ? width * 0.14 : width * 0.18;

          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          const s    = Math.max((r * 2) / photo.width, (r * 2) / photo.height);
          const wImg = photo.width * s;
          const hImg = photo.height * s;
          ctx.drawImage(photo, cx - wImg / 2, cy - hImg / 2, wImg, hImg);
          ctx.restore();

          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.lineWidth    = 12 * scale;
          ctx.strokeStyle  = '#ffffff';
          ctx.stroke();
          ctx.lineWidth    = 3 * scale;
          ctx.strokeStyle  = isQuiz ? '#2dd4bf' : '#f97316';
          ctx.stroke();
        } catch { /* skip */ }
      }

      // Text
      const maxLen        = Math.max(1, userName.length);
      const fs            = ((maxLen > 20 ? 60 : maxLen > 13 ? 76 : 96) - (userPhotoUrl ? 16 : 0)) * scale;
      const fontMontserrat = getComputedStyle(document.documentElement).getPropertyValue('--font-montserrat') || 'Montserrat';
      const fontInter      = getComputedStyle(document.documentElement).getPropertyValue('--font-inter') || 'Inter';

      if (isQuiz) {
        ctx.font      = `400 ${32 * scale}px ${fontInter}, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur  = 16 * scale;
        ctx.fillText('Certificate of Completion', width / 2, h * 0.65);

        ctx.font      = `700 ${fs}px ${fontMontserrat}, sans-serif`;
        ctx.fillStyle = 'white';
        ctx.fillText(userName, width / 2, h * 0.74, width * 0.85);

        ctx.font      = `italic 500 ${40 * scale}px ${fontInter}, sans-serif`;
        ctx.fillStyle = '#2dd4bf';
        ctx.fillText(pledgeName, width / 2, h * 0.82, width * 0.85);

        ctx.font      = `400 ${28 * scale}px ${fontInter}, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.shadowBlur = 0;
        ctx.fillText(date, width / 2, h * 0.88);
      } else {
        const textY = userPhotoUrl ? h * 0.78 : h * 0.75;
        ctx.font        = `700 ${fs}px ${fontMontserrat}, sans-serif`;
        ctx.fillStyle   = 'white';
        ctx.textAlign   = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur  = 16 * scale;
        ctx.fillText(userName || 'Your Name Here', width / 2, textY, width * 0.85);

        ctx.font      = `400 ${28 * scale}px ${fontInter}, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.shadowBlur = 0;
        ctx.fillText(date, width / 2, textY + fs * 1.2);
      }

      // Watermark
      ctx.font      = `500 ${18 * scale}px ${fontInter}, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.textAlign = 'right';
      ctx.shadowBlur = 0;
      ctx.fillText('pledgemarks.com', width - 24 * scale, h - 20 * scale);

    }, [userName, pledgeName, date, bgImageUrl, orgLogoUrl, userPhotoUrl, width, isQuiz, logoPosition, layout]);

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
