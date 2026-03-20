import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const adminToken = req.cookies.get('admin_token');
  if (!adminToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { slug } = await context.params;
    
    // Soft-deleting by setting isActive to false. 
    // Hard deleting would break associated quiz attempts and pledges using foreign keys.
    await prisma.organization.update({
      where: { slug },
      data: { isActive: false }
    });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to deactivate organization' }, { status: 500 });
  }
}
