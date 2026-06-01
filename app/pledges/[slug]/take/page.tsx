export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { PledgeFlow } from '@/components/PledgeFlow';
import prisma from '@/lib/prisma';
import { isCertificateOnly } from '@/lib/pledgeMode';

export async function generateMetadata(context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const pledge = await prisma.pledge.findUnique({ where: { slug } });
  if (!pledge) return {};

  const prefix = isCertificateOnly(pledge) ? 'Get Your Certificate' : 'Take Pledge';
  return {
    title: `${prefix}: ${pledge.name} | Communitree & EZONE`,
  };
}

export default async function TakePledgePage(context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  
  const pledge = await prisma.pledge.findUnique({
    where: { slug },
    include: {
      commitments: { orderBy: { order: 'asc' } },
    }
  });

  if (!pledge) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F0E9] relative">
      <Header />
      <div className="flex-1">
        <PledgeFlow pledge={pledge!} />
      </div>
    </div>
  );
}
