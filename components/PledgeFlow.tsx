"use client";
import React, { useState, useCallback, useRef } from 'react';
import type { Area } from 'react-easy-crop';
import { Pledge, PledgeCommitment } from '@prisma/client';
import { PledgePosterCanvas } from './PledgePosterCanvas';
import { downloadPoster, sharePoster } from '@/utils/downloadPoster';
import { Check, Loader2, Camera, ArrowLeft, Edit2, X } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';

type PledgeWithCommitments = Pledge & { commitments: PledgeCommitment[] };
type PledgeStep = 'details' | 'preview' | 'commitments' | 'success';

interface UserData {
  fullName: string;
  whatsapp: string;
  email: string;
  photoUrl: string | null;
  agreed: boolean;
}

export function PledgeFlow({ pledge }: { pledge: PledgeWithCommitments }) {
  const [currentStep, setCurrentStep]         = useState<PledgeStep>('details');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userData, setUserData]               = useState<UserData>({ fullName: '', whatsapp: '', email: '', photoUrl: null, agreed: true });

  const goToStep = (step: PledgeStep) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      window.scrollTo(0, 0);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  return (
    <div className="min-h-screen relative bg-[#f8fafc]">
      <main className={`relative z-10 max-w-2xl mx-auto px-4 py-12 transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        
        {currentStep === 'details' && (
          <PledgeDetails 
            pledge={pledge}
            userData={userData}
            onChange={(d) => setUserData({...userData, ...d})}
            onNext={() => goToStep('preview')} 
          />
        )}

        {currentStep === 'preview' && (
          <PledgePreview 
            pledge={pledge} 
            userData={userData}
            onBack={() => goToStep('details')}
            onConfirm={() => goToStep('commitments')} 
          />
        )}

        {currentStep === 'commitments' && (
          <PledgeCommitments 
            pledge={pledge} 
            userData={userData}
            onBack={() => goToStep('preview')}
            onSuccess={() => goToStep('success')} 
          />
        )}

        {currentStep === 'success' && (
          <PledgeSuccess 
            pledge={pledge} 
            userData={userData} 
            onReturnHome={() => window.location.href = '/'}
          />
        )}
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// Photo Crop Modal Component
// -------------------------------------------------------------
function PhotoCropModal({ 
  imageSrc, 
  onClose, 
  onCropSave 
}: { 
  imageSrc: string; 
  onClose: () => void; 
  onCropSave: (croppedImage: string) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) onCropSave(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-[1.5rem] w-full max-w-md overflow-hidden flex flex-col items-stretch">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <h3 className="font-bold text-[#1e1b4b] flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-[#f97316]"/> Adjust Photo
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative w-full h-[300px] sm:h-[400px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-4 bg-white flex justify-end gap-3 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-[#1e1b4b] text-white font-bold hover:bg-[#312e81] shadow-md transition-colors">
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Step 1: User Details (Form + Photo)
// -------------------------------------------------------------
function PledgeDetails({ userData, onChange, onNext, pledge }: { userData: UserData, onChange: (d: Partial<UserData>) => void, onNext: () => void, pledge: PledgeWithCommitments }) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef  = useRef<HTMLInputElement>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setRawImageSrc(event.target?.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropSave = (croppedImage: string) => {
    onChange({ photoUrl: croppedImage });
    setRawImageSrc(null);
  };

  const isValid = userData.fullName.length > 2 && userData.email.includes('@') && userData.email.includes('.') && userData.whatsapp.length > 5;

  return (
    <>
      {rawImageSrc && (
        <PhotoCropModal 
          imageSrc={rawImageSrc} 
          onClose={() => setRawImageSrc(null)} 
          onCropSave={handleCropSave} 
        />
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 text-[#f97316] font-bold text-[10px] uppercase tracking-widest mb-4">
          MY PLEDGE FOR {pledge.name.toUpperCase()}
        </div>
        <h2 className="text-3xl font-extrabold text-[#111827] mb-12 tracking-tight">Enter Details</h2>
        
        {/* Photo Upload Area */}
        <div className="flex flex-col items-center mb-10">
          <div
            onClick={() => galleryRef.current?.click()}
            className="w-28 h-28 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden group"
          >
            {userData.photoUrl ? (
              <img src={userData.photoUrl} className="w-full h-full object-cover" alt="User" />
            ) : (
              <Camera className="w-8 h-8 text-gray-300 group-hover:text-gray-400 transition-colors" />
            )}
            <div className="absolute right-0 bottom-0 w-8 h-8 bg-[#1e1b4b] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <Edit2 className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Gallery input — no capture, opens photo library */}
          <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {/* Camera input — capture="user" opens front camera directly */}
          <input ref={cameraRef}  type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileChange} />

          <div className="flex gap-4 mt-6 text-[10px] font-bold text-[#1e1b4b] uppercase tracking-widest">
            <button type="button" onClick={() => galleryRef.current?.click()} className="hover:text-[#f97316] transition-colors">UPLOAD PHOTO</button>
            <div className="w-[1px] h-3 bg-gray-300" />
            <button type="button" onClick={() => cameraRef.current?.click()} className="hover:text-[#f97316] transition-colors">USE CAMERA</button>
          </div>
        </div>

        <div className="space-y-6 text-left mb-10">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">FULL NAME</label>
            <input 
              type="text" 
              value={userData.fullName}
              onChange={e => onChange({ fullName: e.target.value })}
              className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 focus:bg-white transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
              placeholder="John Doe"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">WHATSAPP</label>
              <div className="flex">
                <div className="bg-gray-50/50 border border-gray-200 border-r-0 rounded-l-xl px-4 py-3.5 text-sm text-gray-600 font-medium flex items-center justify-center">
                  India (+91)
                </div>
                <input 
                  type="tel" 
                  value={userData.whatsapp}
                  onChange={e => onChange({ whatsapp: e.target.value })}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-r-xl px-4 py-3.5 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 focus:bg-white transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                  placeholder="98765 43210"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">EMAIL</label>
              <input 
                type="email" 
                value={userData.email}
                onChange={e => onChange({ email: e.target.value })}
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-50 focus:bg-white transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <label className="flex items-start gap-4 cursor-pointer group mt-6 pt-4">
            <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors ${userData.agreed ? 'bg-[#f97316] border-[#f97316]' : 'bg-gray-50 border-gray-300 group-hover:border-gray-400'}`}>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={userData.agreed} 
                onChange={(e) => onChange({ agreed: e.target.checked })} 
              />
              {userData.agreed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </div>
            <span className="text-sm text-gray-600 leading-snug select-none">
              I agree to receive information about similar initiatives in the future. (Optional)
            </span>
          </label>
        </div>

        <button 
          onClick={onNext}
          disabled={!isValid}
          className={`w-full py-4 rounded-xl font-bold text-[15px] transition-all
            ${isValid 
              ? 'bg-[#e2e8f0] text-gray-900 hover:bg-[#cbd5e1] shadow-sm' 
              : 'bg-[#f1f5f9] text-gray-400 cursor-not-allowed'}`}
        >
          Continue <span className="ml-1">›</span>
        </button>

      </div>
    </>
  );
}

// -------------------------------------------------------------
// Step 2: Preview
// -------------------------------------------------------------
function PledgePreview({ userData, pledge, onBack, onConfirm }: { userData: UserData, pledge: PledgeWithCommitments, onBack: () => void, onConfirm: () => void }) {
  const today = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12 text-center">
      <div className="flex justify-between items-center mb-10">
        <button onClick={onBack} className="text-sm font-semibold text-gray-500 hover:text-gray-800 flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Edit Details
        </button>
        <div className="bg-orange-50 text-[#f97316] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Step 2 of 3
        </div>
      </div>
      
      <h2 className="text-2xl font-extrabold text-[#1e1b4b] mb-2 tracking-tight">Preview Certificate</h2>
      <p className="text-sm text-gray-500 mb-10">Review your details carefully. This is how your certificate will look.</p>
      
      <div className="max-w-[400px] mx-auto mb-10 shadow-2xl shadow-black/10 rounded-[1.5rem] overflow-hidden bg-white">
        <PledgePosterCanvas 
          userName={userData.fullName}
          pledgeName={pledge.name}
          date={today}
          bgImageUrl={pledge.bgImageUrl}
          userPhotoUrl={userData.photoUrl}
          width={800} // higher res for better anti-aliasing in preview
          layout={['house-sparrow', 'sustainable-101', 'wooden-earbuds'].includes(pledge.slug) ? 'sparrow' : 'default'}
        />
      </div>

      <div className="flex gap-4 max-w-[400px] mx-auto">
        <button 
          onClick={onBack}
          className="flex-[0.35] py-4 rounded-xl border-2 border-gray-100 text-gray-700 font-bold hover:bg-gray-50 transition-colors shadow-sm bg-white flex items-center justify-center gap-2"
        >
          <Edit2 className="w-4 h-4 text-gray-400"/> Modify
        </button>
        <button 
          onClick={onConfirm}
          className="flex-[0.65] py-4 rounded-xl bg-[#f97316] text-white font-bold hover:bg-[#ea580c] transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          Looks Good <Check className="w-4 h-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Step 3: Commitments (The Checkboxes) & Submission
// -------------------------------------------------------------
function PledgeCommitments({ pledge, userData, onBack, onSuccess }: { pledge: PledgeWithCommitments, userData: UserData, onBack: () => void, onSuccess: () => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const allChecked  = pledge.commitments.length > 0 && pledge.commitments.every(c => checked[c.id]);

  const handleSelectAll = () => {
    const next = !allChecked;
    setChecked(Object.fromEntries(pledge.commitments.map(c => [c.id, next])));
  };
  
  const handleToggle = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pledgeId: pledge.id,
          userName: userData.fullName,
          userEmail: userData.email,
          whatsapp: userData.whatsapp,
          agreed: userData.agreed,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit your pledge. Please try again.');
      }

      onSuccess();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative flex flex-col min-h-[70vh]">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-[17px] font-bold text-[#1e1b4b] absolute left-1/2 -translate-x-1/2">The Pledge</h2>
        <button 
          onClick={handleSelectAll} 
          className="text-[11px] font-bold text-[#f97316] uppercase tracking-wider relative group"
        >
          {allChecked ? 'DESELECT ALL' : 'SELECT ALL'}
          <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#f97316] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
        </button>
      </div>
      
      {/* Commitment List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
        {pledge.commitments.map((c) => (
          <label key={c.id} className="flex items-start gap-4 cursor-pointer group">
            <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors ${checked[c.id] ? 'bg-[#1e1b4b] border-[#1e1b4b]' : 'border-gray-300 bg-white group-hover:border-[#1e1b4b]'}`}>
              {checked[c.id] && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </div>
            <span className={`text-[15px] leading-snug select-none transition-colors ${checked[c.id] ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-700'}`}>
              {c.text}
            </span>
          </label>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent pt-16 mt-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium animate-shake">
            {error}
          </div>
        )}
        <button 
          onClick={handleSubmit}
          disabled={!allChecked || isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-[15px] transition-all flex items-center justify-center gap-2
            ${allChecked 
              ? 'bg-[#1e1b4b] text-white hover:bg-[#312e81] shadow-lg shadow-indigo-900/20' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'}`}
        >
          {isSubmitting ? (
             <><Loader2 className="w-5 h-5 animate-spin"/> Processing...</>
          ) : (
            `Take the Pledge ${allChecked ? "→" : ""}`
          )}
        </button>
        {!allChecked && <p className="text-center text-xs text-gray-400 mt-3">Select all to continue</p>}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Step 4: Success
// -------------------------------------------------------------
function PledgeSuccess({ pledge, userData, onReturnHome }: { pledge: PledgeWithCommitments, userData: UserData, onReturnHome: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const today = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  const handleDownload = () => {
    if (canvasRef.current) downloadPoster(canvasRef.current, userData.fullName);
  };

  const handleShare = () => {
    if (canvasRef.current) sharePoster(canvasRef.current, userData.fullName, window.location.href);
  };

  return (
    <div className="text-center pt-8">
      <div className="w-16 h-16 bg-[#dcfce7] text-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
        <Check className="w-8 h-8" strokeWidth={3} />
      </div>
      <h2 className="text-3xl font-extrabold text-[#111827] mb-2 tracking-tight">Pledge Taken! <span className="ml-1">🎉</span></h2>
      <p className="text-gray-500 mb-10">Thank you, <span className="font-bold text-gray-900">{userData.fullName}</span>.<br/>You have successfully pledged to honor the impact.</p>
      
      {/* Hidden HD Canvas for Download */}
      <div className="hidden">
        <PledgePosterCanvas 
          ref={canvasRef}
          userName={userData.fullName}
          pledgeName={pledge.name}
          date={today}
          bgImageUrl={pledge.bgImageUrl}
          userPhotoUrl={userData.photoUrl}
          width={1080}
          layout={['house-sparrow', 'sustainable-101', 'wooden-earbuds'].includes(pledge.slug) ? 'sparrow' : 'default'}
        />
      </div>

      <div className="max-w-[400px] mx-auto mb-10 shadow-2xl shadow-black/10 rounded-[1.5rem] overflow-hidden pointer-events-none bg-white">
         <PledgePosterCanvas 
          userName={userData.fullName}
          pledgeName={pledge.name}
          date={today}
          bgImageUrl={pledge.bgImageUrl}
          userPhotoUrl={userData.photoUrl}
          width={800} // Same nice preview size
          layout={['house-sparrow', 'sustainable-101', 'wooden-earbuds'].includes(pledge.slug) ? 'sparrow' : 'default'}
        />
      </div>

      <div className="flex gap-4 max-w-[400px] mx-auto mb-6">
        <button 
          onClick={handleDownload}
          className="flex-1 py-4.5 rounded-xl bg-[#292524] text-white font-bold hover:bg-black transition-colors shadow-md flex items-center justify-center text-[15px]"
        >
          ⬇ Download
        </button>
        <button 
          onClick={handleShare}
          className="flex-1 py-4.5 rounded-xl bg-[#f97316] text-white font-bold hover:bg-[#ea580c] transition-colors shadow-md flex items-center justify-center text-[15px]"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg> 
          Share
        </button>
      </div>
      
      <div className="max-w-[400px] mx-auto pb-10">
        <button 
          onClick={onReturnHome}
          className="w-full py-4.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center bg-white text-[15px]"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          RETURN HOME
        </button>
      </div>
    </div>
  );
}
