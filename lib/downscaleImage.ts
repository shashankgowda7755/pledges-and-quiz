// Downscale a user-selected image in the browser BEFORE upload.
// A large phone photo (e.g. 6000x8000) decodes to width*height*4 bytes in
// memory (~192MB) once mounted in the certificate designer — enough to OOM the
// tab. Posters render at 1080x1350, so a 2000px cap loses no visible quality
// while slashing decoded-memory and upload size. Returns the original file
// untouched for vector/animated types or when already within the cap.
export async function downscaleImage(file: File, maxEdge = 2000): Promise<File> {
  // Skip non-raster / types where re-encode would harm: SVG (vector), GIF (animation).
  if (
    !file.type.startsWith('image/') ||
    file.type === 'image/svg+xml' ||
    file.type === 'image/gif'
  ) {
    return file;
  }

  let bmp: ImageBitmap | null = null;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return file; // decode failed — let the server handle the original
  }

  const { width, height } = bmp;
  const longest = Math.max(width, height);
  if (longest <= maxEdge) {
    bmp.close?.();
    return file;
  }

  const scale = maxEdge / longest;
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bmp.close?.();
    return file;
  }
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close?.();

  // Keep alpha for png/webp; everything else -> jpeg (smaller, no alpha needed).
  const keepAlpha = file.type === 'image/png' || file.type === 'image/webp';
  const outType = keepAlpha ? 'image/png' : 'image/jpeg';
  const quality = outType === 'image/jpeg' ? 0.9 : undefined;

  const blob: Blob | null = await new Promise(res =>
    canvas.toBlob(b => res(b), outType, quality)
  );
  // Free the canvas bitmap promptly.
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) return file;

  const base = file.name.replace(/\.[^.]+$/, '');
  const ext = outType === 'image/png' ? 'png' : 'jpg';
  return new File([blob], `${base}.${ext}`, { type: outType });
}
