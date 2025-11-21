import { NextResponse } from 'next/server';
import { startJob } from '../../../../lib/crawler';
import { JobRequest } from '../../../../lib/types';

export async function POST(req: Request) {
  const body = (await req.json()) as JobRequest & { adminKey?: string };
  const headerKey = req.headers.get('x-admin-key');
  if (!process.env.NEXT_PUBLIC_ADMIN_KEY || headerKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
    return NextResponse.json({ error: 'Admin key non valida' }, { status: 401 });
  }

  const startUrls = body.startUrls || [];
  if (!Array.isArray(startUrls) || startUrls.length === 0) {
    return NextResponse.json({ error: 'Inserire almeno una URL di categoria/listing' }, { status: 400 });
  }

  if (!body.domain.startsWith('http')) {
    return NextResponse.json({ error: 'Dominio non valido' }, { status: 400 });
  }

  const id = await startJob({
    domain: body.domain,
    startUrls,
    maxProducts: body.maxProducts || 20,
    dynamic: body.dynamic || false,
    locale: body.locale,
  });

  return NextResponse.json({ id });
}
