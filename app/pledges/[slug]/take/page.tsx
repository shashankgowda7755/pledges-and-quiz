export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { PledgeFlow } from '@/components/PledgeFlow';
import EventClosed from '@/components/EventClosed';
import prisma from '@/lib/prisma';
import { isCertificateOnly } from '@/lib/pledgeMode';

export async function generateMetadata(context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const pledge = await prisma.pledge.findUnique({ where: { slug } });
  if (!pledge) return {};

  const prefix = isCertificateOnly(pledge) ? 'Get Your Certificate' : 'Take Pledge';
  return {
    title: `${prefix}: ${pledge.name} | COMMUNITREE & EZONE`,
  };
}

export default async function TakePledgePage(context: { params: Promise<{ slug: string }>; searchParams: Promise<{ org?: string }> }) {
  const { slug } = await context.params;
  const { org } = await context.searchParams;

  const [pledge, attributedOrg] = await Promise.all([
    prisma.pledge.findUnique({
      where: { slug },
      include: {
        commitments: { orderBy: { order: 'asc' } },
      }
    }),
    org
      ? prisma.organization.findFirst({ where: { slug: org, isActive: true }, select: { id: true } })
      : null,
  ]);

  if (!pledge) notFound();

  if (!pledge.isActive) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F2F0E9] relative">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <EventClosed slug={pledge.slug} kind="pledge" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F0E9] relative">
      <Header />
      <div className="flex-1">
        <PledgeFlow pledge={pledge!} orgId={attributedOrg?.id} />
      </div>
    </div>
  );
}
