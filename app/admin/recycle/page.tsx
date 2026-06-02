'use client';

import RecycleOverlay from '@/components/RecycleOverlay';

// Admin tool: upload any photo, overlay the recycle ring, download merged PNG.
export default function AdminRecyclePage() {
  return (
    <div className="pb-16 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recycle Frame</h1>
        <p className="text-gray-500 text-sm mt-2">
          Upload a photo to overlay the recycle ring. Photo sits behind, ring on top — center stays clear. Preview live, then download a single merged PNG.
        </p>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-8 max-w-md">
        <RecycleOverlay allowUpload filename="recycle-frame" />
      </div>
    </div>
  );
}
