import { NextResponse } from 'next/server';
import { getJobStatus } from '../../../../lib/crawler';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const status = getJobStatus(id);
  if (!status) return NextResponse.json({ error: 'Job non trovato' }, { status: 404 });
  return NextResponse.json({ status });
}
