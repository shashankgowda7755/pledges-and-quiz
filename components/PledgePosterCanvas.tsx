"use client";
import React, { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';

interface TuningParams {
  dropX?: number;
  dropY?: number;
  dropW?: number;
  dropH?: number;
  nameX?: number;
  nameY?: number;
  nameFontSize?: number;
  letterSpacing?: number;
}

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
  tuning?:       TuningParams;
}

export const PledgePosterCanvas = forwardRef<HTMLCanvasElement, Props>(
  ({ userName, bgImageUrl, userPhotoUrl, width = 1080, orgLogoUrl, logoPosition, layout, tuning }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useImperativeHandle(ref, () => canvasRef.current!);

    const draw = useCallback(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const scale = width / 1080;
      // Use standard A4 aspect ratio (1:sqrt(2)) for water pledge
      const a4Ratio = 1123 / 794; /* approx 1.41435 */
      const h     = layout === 'water' ? Math.round(width * a4Ratio) : Math.round(1350 * scale);
      canvas.width  = width;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // ── WATER PLEDGE LAYOUT ──────────────────────────────────────────────
      if (layout === 'water') {
        // 1. Background poster — cover-fit so any uploaded poster fills A4 without distortion
        try {
          const bg = await loadImage(bgImageUrl);
          const bgRatio = bg.width / bg.height;
          const cvRatio = width / h;
          let bx = 0, by = 0, bw = width, bh = h;
          if (bgRatio > cvRatio) {
            bh = h; bw = h * bgRatio; bx = (width - bw) / 2;
          } else {
            bw = width; bh = width / bgRatio; by = 0;
          }
          ctx.drawImage(bg, bx, by, bw, bh);
        } catch (err) {
          console.error('[PosterCanvas] Failed to load background:', bgImageUrl, err);
          ctx.fillStyle = '#dbeafe';
          ctx.fillRect(0, 0, width, h);
        }

        // 2. User photo clipped to water drop shape
        if (userPhotoUrl) {
          try {
            const photo = await loadImage(userPhotoUrl);

            // Coordinates based on 794x1123 A4 canvas — drop below tap (~36% of width)
            const baseW = 794;
            const baseH = 1123;
            const dropX  = (tuning?.dropX ?? 155 * (width / baseW));
            const dropY  = (tuning?.dropY ?? 340 * (h / baseH));
            const dropW  = (tuning?.dropW ?? 260 * (width / baseW));
            const dropH  = (tuning?.dropH ?? 380 * (h / baseH));
            
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

        // 3. Name — Big Shoulders Display Bold, loaded via FontFace API
        if (userName) {
          const fontName = 'Big Shoulders Display';
          const alreadyLoaded = [...document.fonts].some(f => f.family === fontName && f.status === 'loaded');
          if (!alreadyLoaded) {
            try {
              const font = new FontFace(
                fontName,
                'url(https://fonts.gstatic.com/s/bigshouldersdisplay/v21/fC1MPZJEZG-e9gHhdI4-NBbfd2ys3SjJCx12wPgf9g-_3F0YdY86JF46SRP4yZQ.woff2)',
                { weight: '700', style: 'normal' }
              );
              const loaded = await font.load();
              document.fonts.add(loaded);
            } catch { /* fallback gracefully */ }
          }

          // Name aligned with title column: left edge ~52%, right edge ~80% of width
          const nameX    = tuning?.nameX ?? (0.52 * width + 4 * scale);
          const nameY    = tuning?.nameY ?? (0.34 * h);
          const nameMaxW = (0.92 * width) - nameX;

          const displayName = userName.toUpperCase();
          const fsMax = tuning?.nameFontSize ?? (65 * (width / 794));

          ctx.shadowColor  = 'transparent';
          ctx.shadowBlur   = 0;
          ctx.textAlign    = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillStyle    = '#00063d';

          // Set letter spacing first so measureText accounts for it
          const letterSpacingPx = (tuning?.letterSpacing ?? 4) * scale;
          if ('letterSpacing' in ctx) {
            (ctx as any).letterSpacing = `${letterSpacingPx}px`;
          }

          // Measure at max size, then scale down proportionally to fit
          ctx.font = `700 ${fsMax}px "${fontName}", sans-serif`;
          const measured = ctx.measureText(displayName).width;
          let fs = fsMax;
          if (measured > nameMaxW) {
            fs = Math.max(20 * scale, fsMax * (nameMaxW / measured));
            ctx.font = `700 ${fs}px "${fontName}", sans-serif`;
          }

          ctx.fillText(displayName, nameX, nameY);

          if ('letterSpacing' in ctx) {
            (ctx as any).letterSpacing = '0px';
          }
        }

        // 4. Watermark
        const fontInter = getComputedStyle(document.documentElement)
          .getPropertyValue('--font-inter') || 'Inter';
        ctx.font      = `500 ${13 * scale}px ${fontInter}, sans-serif`;
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.textAlign = 'right';
        ctx.fillText('communitree.in', width - 20 * scale, h - 16 * scale);

        // 5. Org logo overlay
        if (orgLogoUrl) {
          try {
            const logo = await loadImage(orgLogoUrl);
            let lx = 200 * scale, ly = h - (250 * scale), lw = 150 * scale; // Default bottom-leftish
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

    }, [userName, bgImageUrl, userPhotoUrl, width, orgLogoUrl, logoPosition, layout, tuning]);

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
