import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const ext = file.name.split('.').pop() ?? 'png';
  const filename = `logos/${Date.now()}.${ext}`;

  const blob = await put(filename, file, { access: 'public' });
  return NextResponse.json({ url: blob.url });
}
