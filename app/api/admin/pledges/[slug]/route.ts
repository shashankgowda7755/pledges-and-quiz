import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const adminToken = req.cookies.get('admin_token');
  if (!adminToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { slug } = await context.params;
    const body = await req.json();

    // Only update fields that were sent.
    const data: Record<string, unknown> = {};
    for (const k of ['name', 'description', 'category', 'bgImageUrl', 'impactMetric'] as const) {
      if (body[k] !== undefined) data[k] = body[k];
    }
    if (body.impactPerUnit !== undefined) data.impactPerUnit = parseFloat(body.impactPerUnit);
    if (body.certConfig !== undefined) data.certConfig = body.certConfig || null;
    if (body.isCertificateOnly !== undefined) data.isCertificateOnly = Boolean(body.isCertificateOnly);
    if (body.eventDate !== undefined) data.eventDate = body.eventDate ? new Date(body.eventDate) : null;
    if (body.eventId !== undefined) data.eventId = body.eventId || null;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const updated = await prisma.pledge.update({ where: { slug }, data });
    return NextResponse.json({ ok: true, pledge: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const adminToken = req.cookies.get('admin_token');
  if (!adminToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { slug } = await context.params;
    
    await prisma.pledge.update({
      where: { slug },
      data: { isActive: false }
    });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
