"use client";
import { PledgeFlow } from '@/components/PledgeFlow';

// Full mock of the water pledge — mirrors exact DB shape
const WATER_PLEDGE = {
  id: 'mock-water-pledge',
  slug: 'water-pledge',
  name: 'My Water Pledge',
  description: 'Small action, lasting impact. Commit to valuing every drop of water.',
  category: 'environment',
  bgImageUrl: '/images/pledges/rain water.png',
  impactMetric: 'litres_saved',
  impactPerUnit: 50,
  isActive: true,
  isFeatured: true,
  eventDate: new Date('2026-04-17T00:00:00.000Z'),
  createdAt: new Date(),
  orgId: null,
  organization: null,
  commitments: [
    { id: 'c1', pledgeId: 'mock-water-pledge', text: 'I will turn off taps when not in use', order: 1 },
    { id: 'c2', pledgeId: 'mock-water-pledge', text: 'I will be mindful of my daily water consumption', order: 2 },
    { id: 'c3', pledgeId: 'mock-water-pledge', text: 'I will reuse water wherever possible', order: 3 },
    { id: 'c4', pledgeId: 'mock-water-pledge', text: 'I will adopt water-efficient habits every day', order: 4 },
    { id: 'c5', pledgeId: 'mock-water-pledge', text: 'I will report or fix leaking taps and pipes immediately', order: 5 },
    { id: 'c6', pledgeId: 'mock-water-pledge', text: 'I will not ignore water wastage in public or shared spaces', order: 6 },
    { id: 'c7', pledgeId: 'mock-water-pledge', text: 'I will support rainwater harvesting in my home or community', order: 7 },
    { id: 'c8', pledgeId: 'mock-water-pledge', text: 'I will inspire at least one person to take this pledge', order: 8 },
  ],
};

export default function FullWaterPledgePreview() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F2F0E9] relative">
      {/* Simple header */}
      <header className="w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="font-montserrat font-black text-lg tracking-tight text-[#1e1b4b]">COMMUNITREE &amp; EZONE</span>
        <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">Preview Mode</span>
      </header>
      <div className="flex-1">
        <PledgeFlow pledge={WATER_PLEDGE} />
      </div>
    </div>
  );
}
