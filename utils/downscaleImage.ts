/**
 * Reads a File from <input type="file"> and returns a downscaled JPEG data URL
 * suitable for fast preview/cropping. Original aspect ratio is preserved.
 *
 * Why: phone photos are routinely 4000×3000+ and base64-encode to 12–20 MB,
 * which is slow to readAsDataURL, slow to paint inside react-easy-crop, and
 * unnecessary detail for a head-and-shoulders crop.
 *
 * The cropper still operates on this downscaled copy; the resulting cropped
 * area is then re-rendered onto the certificate canvas, which is the actual
 * output. So the source photo never needs to be larger than the final slot.
 */
export async function downscaleImage(file: File, maxEdge = 1500, quality = 0.85): Promise<string> {
  // Use createImageBitmap when available — much faster than <img>.onload
  let bitmap: ImageBitmap | null = null;
  try {
    if (typeof createImageBitmap === 'function') {
      bitmap = await createImageBitmap(file);
    }
  } catch { /* fall through to <img> path */ }

  let width: number, height: number;
  let source: CanvasImageSource;

  if (bitmap) {
    width  = bitmap.width;
    height = bitmap.height;
    source = bitmap;
  } else {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload  = () => resolve(i);
        i.onerror = (e) => reject(e);
        i.src = url;
      });
      width  = img.naturalWidth;
      height = img.naturalHeight;
      source = img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // Scale only if larger than maxEdge on either axis
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const w = Math.round(width  * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width  = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, w, h);

  bitmap?.close?.();

  return canvas.toDataURL('image/jpeg', quality);
}
