export const downloadPoster = (canvas: HTMLCanvasElement, userName: string, prefix = 'Pledge'): void => {
  try {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href     = url;
      link.download = `${prefix}_${userName.replace(/\s+/g, '_')}_PledgeMarks.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  } catch (e) {
    console.error('Download failed:', e);
    alert('Download failed. Please try again.');
  }
};

export const sharePoster = async (
  canvas: HTMLCanvasElement,
  userName: string,
  pledgeUrl: string
): Promise<void> => {
  return new Promise((resolve) => {
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) { resolve(); return; }
        const file = new File([blob], 'pledge_poster.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'My PledgeMarks Pledge',
              text: `I just took a pledge on PledgeMarks. Join me! ${pledgeUrl}`,
            });
          } catch { /* user cancelled */ }
        } else {
          downloadPoster(canvas, userName);
        }
        resolve();
      }, 'image/png');
    } catch (e) {
      console.error('Share failed:', e);
      resolve();
    }
  });
};
