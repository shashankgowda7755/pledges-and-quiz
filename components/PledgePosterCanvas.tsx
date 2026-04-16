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
  ({ userName, bgImageUrl, userPhotoUrl, width = 1080, orgLogoUrl, logoPosition, layout }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useImperativeHandle(ref, () => canvasRef.current!);

    const draw = useCallback(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const scale = width / 1080;
      const h     = Math.round(1350 * scale);
      canvas.width  = width;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // ── WATER PLEDGE LAYOUT ──────────────────────────────────────────────
      if (layout === 'water') {
        // 1. Background poster (full bleed)
        try {
          const bg = await loadImage(bgImageUrl);
          ctx.drawImage(bg, 0, 0, width, h);
        } catch (err) {
          console.error('[PosterCanvas] Failed to load background:', bgImageUrl, err);
          ctx.fillStyle = '#dbeafe';
          ctx.fillRect(0, 0, width, h);
        }

        // 2. User photo clipped to water drop shape
        if (userPhotoUrl) {
          try {
            const photo = await loadImage(userPhotoUrl);

            // Water drop bounding box — exact from Canva advanced panel (final version):
            // X:4.3cm Y:10.07cm W:6.96cm H:10.65cm on 21×29.7cm canvas → 1080×1350px
            const dropX  = Math.round((4.3  / 21)   * 1080) * scale;  // 221
            const dropY  = Math.round((10.07 / 29.7) * 1350) * scale;  // 458
            const dropW  = Math.round((6.96  / 21)   * 1080) * scale;  // 358
            const dropH  = Math.round((10.65 / 29.7) * 1350) * scale;  // 484
            const cx     = dropX + dropW / 2;
            const r      = dropW / 2;     // radius of the circular bottom
            const circCY = dropY + dropH - r; // centre-Y of the bottom circle

            ctx.save();
            // Refined teardrop clipping path — narrow tip, gradual swell, circular base
            ctx.beginPath();
            ctx.moveTo(cx, dropY); // sharp tip at top

            // Right side: stays narrow for top 30%, then sweeps out to full width
            ctx.bezierCurveTo(
              cx + r * 0.22, dropY + dropH * 0.28,  // hug the centreline longer
              cx + r,        circCY - r * 0.75,       // reach full width near base
              cx + r,        circCY                   // rightmost point of circle
            );
            // Bottom arc: right → left clockwise through bottom
            ctx.arc(cx, circCY, r, 0, Math.PI);
            // Left side: mirror of right
            ctx.bezierCurveTo(
              cx - r,        circCY - r * 0.75,
              cx - r * 0.22, dropY + dropH * 0.28,
              cx,            dropY
            );
            ctx.closePath();
            ctx.clip();

            // Cover-fill photo inside the drop
            const s  = Math.max(dropW / photo.width, dropH / photo.height);
            const pw = photo.width * s;
            const ph = photo.height * s;
            ctx.drawImage(photo, dropX + (dropW - pw) / 2, dropY + (dropH - ph) / 2, pw, ph);
            ctx.restore();

            // Re-draw background on top with 'destination-over' to let the
            // poster's water-drop graphic partially show through the edges
            // (skip if bg loaded fine — bg is already underneath)
          } catch { /* skip photo */ }
        }

        // 3. Name — exact Canva position: X=13.81cm Y=8.95cm W=5.94cm H=1.78cm
        //    on 21×29.7cm canvas → 1080×1350px. Font: Big Shoulders Display 42.4pt
        if (userName) {
          const fontMontserrat = getComputedStyle(document.documentElement)
            .getPropertyValue('--font-montserrat').trim() || 'Montserrat';

          // Canva → 1080×1350 conversion (final version)
          // Text box: X=13.97cm Y=10.04cm W=5.94cm H=1.78cm on 21×29.7cm canvas
          const nameX    = Math.round((13.97 / 21) * 1080) * scale;
          const nameY    = Math.round(((10.04 + 1.78 / 2) / 29.7) * 1350) * scale;
          const nameMaxW = Math.round((5.94 / 21) * 1080) * scale;
          // 42.4pt on 842pt-tall → 68px on 1350px
          const fs       = 68 * scale;

          ctx.shadowColor  = 'transparent';
          ctx.shadowBlur   = 0;
          ctx.textAlign    = 'left';
          ctx.textBaseline = 'middle';
          ctx.font         = `900 ${fs}px ${fontMontserrat}, sans-serif`;
          ctx.fillStyle    = '#0a0a0a';
          ctx.fillText(userName.toUpperCase(), nameX, nameY, nameMaxW);
        }

        // 4. Watermark
        const fontInter = getComputedStyle(document.documentElement)
          .getPropertyValue('--font-inter') || 'Inter';
        ctx.font      = `500 ${13 * scale}px ${fontInter}, sans-serif`;
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.textAlign = 'right';
        ctx.fillText('communitree.in', width - 20 * scale, h - 16 * scale);

        return; // done with water layout
      }

      // ── DEFAULT / SPARROW LAYOUT ─────────────────────────────────────────

      // 1. Background poster (full bleed)
      try {
        const bg = await loadImage(bgImageUrl);
        ctx.drawImage(bg, 0, 0, width, h);
      } catch (err) {
        console.error('[PosterCanvas] Failed to load background:', bgImageUrl, err);
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, width, h);
      }

      // 2. Photo — rectangle slot matched to the white placeholder on the poster
      const baseW = 2500;
      const baseH = 3536;

      const rx = ((1321.2 + 190) / baseW) * width;
      const ry = ((720.3 + 100) / baseH) * h;
      const rw = ((998 - 190) / baseW) * width;
      const rh = (974.1 / baseH) * h;
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

        const nameXBase  = 992.4 + 1345.9;
        const nameYBase  = 1950.4 + (185.1 / 2);
        const nameMaxW   = (1345.9 / baseW) * width;

        const nameX = (nameXBase / baseW) * width;
        const nameY = (nameYBase / baseH) * h;

        const maxLen = Math.max(1, userName.length);
        const fs     = (maxLen > 18 ? 50 : maxLen > 12 ? 65 : 80) * scale;

        ctx.shadowColor  = 'transparent';
        ctx.shadowBlur   = 0;
        ctx.textAlign    = 'right';
        ctx.textBaseline = 'middle';
        ctx.font         = `700 ${fs}px ${fontMontserrat}, sans-serif`;
        ctx.fillStyle    = '#1a2744';

        ctx.fillText(userName, nameX, nameY, nameMaxW);
      }

      // 4. Subtle watermark
      const fontInter = getComputedStyle(document.documentElement)
        .getPropertyValue('--font-inter') || 'Inter';
      ctx.font      = `500 ${15 * scale}px ${fontInter}, sans-serif`;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.textAlign = 'right';
      ctx.shadowBlur = 0;
      ctx.fillText('communitree.in', width - 20 * scale, h - 16 * scale);

      // 5. Org logo overlay
      if (orgLogoUrl) {
        try {
          const logo = await loadImage(orgLogoUrl);
          let lx = 200 * scale, ly = 1100 * scale, lw = 150 * scale;
          if (logoPosition) {
            try {
              const pos = JSON.parse(logoPosition);
              if (pos.x !== undefined) lx = pos.x * scale;
              if (pos.y !== undefined) ly = pos.y * scale;
              if (pos.w !== undefined) lw = pos.w * scale;
            } catch { /* use defaults */ }
          }
          const lh = (logo.height / logo.width) * lw;
          ctx.drawImage(logo, lx, ly, lw, lh);
        } catch { /* skip if logo fails */ }
      }

    }, [userName, bgImageUrl, userPhotoUrl, width, orgLogoUrl, logoPosition, layout]);

    useEffect(() => { draw(); }, [draw]);

    return <canvas ref={canvasRef} style={{ width: '100%', borderRadius: 12, display: 'block' }} />;
  }
);
PledgePosterCanvas.displayName = 'PledgePosterCanvas';

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const isAbsoluteExternal = src.startsWith('http') && !src.startsWith(window.location.origin);
    if (isAbsoluteExternal) {
      img.crossOrigin = 'anonymous';
    }
    img.onload  = () => resolve(img);
    img.onerror = (e) => reject(e);
    // Make relative URLs absolute so the canvas context can always resolve them
    img.src = src.startsWith('/') ? `${window.location.origin}${src}` : src;
  });
