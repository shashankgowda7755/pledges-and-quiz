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
  width?:        number; // default 1080
  isQuiz?:       boolean; // if true, slightly different layout
}

export const PledgePosterCanvas = forwardRef<HTMLCanvasElement, Props>(
  ({ userName, pledgeName, date, bgImageUrl, orgLogoUrl, userPhotoUrl, logoPosition, width = 1080, isQuiz = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useImperativeHandle(ref, () => canvasRef.current!);

    const draw = useCallback(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const scale  = width / 1080;
      const h      = Math.round(1350 * scale);
      canvas.width = width; canvas.height = h;
      const ctx    = canvas.getContext('2d')!;

      // 1. Background
      try {
        const bg = await loadImage(bgImageUrl);
        ctx.drawImage(bg, 0, 0, width, h);
      } catch (e) {
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, width, h);
      }

      // 2. Dark vignette (bottom 50%)
      const grad = ctx.createLinearGradient(0, h * 0.5, 0, h);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.75)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, h);

      // 3. Org logo
      if (orgLogoUrl && logoPosition) {
        try {
          const pos = JSON.parse(logoPosition);
          const logo = await loadImage(orgLogoUrl);
          ctx.drawImage(logo,
            pos.x * scale, pos.y * scale,
            pos.w * scale, pos.w * scale);
        } catch { /* skip if fails */ }
      }

      // 3.5. User Photo
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

          // Cover
          const s = Math.max((r * 2) / photo.width, (r * 2) / photo.height);
          const wImg = photo.width * s;
          const hImg = photo.height * s;
          ctx.drawImage(photo, cx - wImg / 2, cy - hImg / 2, wImg, hImg);
          ctx.restore();

          // Border
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.lineWidth = 12 * scale;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
          ctx.lineWidth = 3 * scale;
          ctx.strokeStyle = isQuiz ? '#2dd4bf' : '#f97316';
          ctx.stroke();
        } catch (e) {
          console.error("Failed to load user photo", e);
        }
      }

      // 4. User name (responsive font size)
      const maxLen = Math.max(1, userName.length);
      const fs = ((maxLen > 20 ? 60 : maxLen > 13 ? 76 : 96) - (userPhotoUrl ? 16 : 0)) * scale;
      
      const fontMontserrat = getComputedStyle(document.documentElement).getPropertyValue('--font-montserrat') || 'Montserrat';
      const fontInter = getComputedStyle(document.documentElement).getPropertyValue('--font-inter') || 'Inter';

      if (isQuiz) {
        // Top text "Certificate of Completion"
        ctx.font        = `400 ${32 * scale}px ${fontInter}, sans-serif`;
        ctx.fillStyle   = 'rgba(255,255,255,0.9)';
        ctx.textAlign   = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur  = 16 * scale;
        ctx.fillText('Certificate of Completion', width / 2, h * 0.65);
        
        // Name
        ctx.font        = `700 ${fs}px ${fontMontserrat}, sans-serif`;
        ctx.fillStyle   = 'white';
        ctx.fillText(userName, width / 2, h * 0.74, width * 0.85);

        // Quiz Title
        ctx.font        = `italic 500 ${40 * scale}px ${fontInter}, sans-serif`;
        ctx.fillStyle   = '#2dd4bf'; // teal-400
        ctx.fillText(pledgeName, width / 2, h * 0.82, width * 0.85);

        // Date
        ctx.font        = `400 ${28 * scale}px ${fontInter}, sans-serif`;
        ctx.fillStyle   = 'rgba(255,255,255,0.8)';
        ctx.shadowBlur  = 0;
        ctx.fillText(date, width / 2, h * 0.88);
      } else {
        const textY = userPhotoUrl ? h * 0.78 : h * 0.75;
        ctx.font        = `700 ${fs}px ${fontMontserrat}, sans-serif`;
        ctx.fillStyle   = 'white';
        ctx.textAlign   = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur  = 16 * scale;
        ctx.fillText(userName || "Your Name Here", width / 2, textY, width * 0.85);

        // Date
        ctx.font        = `400 ${28 * scale}px ${fontInter}, sans-serif`;
        ctx.fillStyle   = 'rgba(255,255,255,0.8)';
        ctx.shadowBlur  = 0;
        ctx.fillText(date, width / 2, textY + fs * 1.2);
      }

      // Watermark
      ctx.font        = `500 ${18 * scale}px ${fontInter}, sans-serif`;
      ctx.fillStyle   = 'rgba(255,255,255,0.45)';
      ctx.textAlign   = 'right';
      ctx.shadowBlur  = 0;
      ctx.fillText('pledgemarks.com', width - 24 * scale, h - 20 * scale);
    }, [userName, pledgeName, date, bgImageUrl, orgLogoUrl, userPhotoUrl, width, isQuiz, logoPosition]);

    useEffect(() => { draw(); }, [draw]);

    return <canvas ref={canvasRef} style={{ width: '100%', borderRadius: 12, display: 'block' }} />;
  }
);
PledgePosterCanvas.displayName = 'PledgePosterCanvas';

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
