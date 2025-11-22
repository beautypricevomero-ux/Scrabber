import { NextResponse } from 'next/server';
import { readJob } from '../../../../lib/storage';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  if (!jobId) {
    return NextResponse.json({ error: 'jobId mancante' }, { status: 400 });
  }
  const job = await readJob(jobId);
  if (!job) {
    return NextResponse.json({ error: 'Job non trovato' }, { status: 404 });
  }
  return NextResponse.json(job);
}
