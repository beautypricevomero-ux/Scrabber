import { NextResponse } from 'next/server';
import { createJob } from '../../../../lib/storage';
import { runCrawler } from '../../../../lib/crawler';
import { ScrapeJobInput } from '../../../../lib/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<ScrapeJobInput>;
  const startUrls = Array.isArray(body.startUrls) ? body.startUrls.filter((url) => url.startsWith('https://www.sephora.it')) : [];
  const maxProducts = typeof body.maxProducts === 'number' && body.maxProducts > 0 ? body.maxProducts : 20;

  if (startUrls.length === 0) {
    return NextResponse.json({ error: 'startUrls obbligatorio (https://www.sephora.it)' }, { status: 400 });
  }

  const job = await createJob({ startUrls, maxProducts });

  runCrawler(job.id, job.input).catch((err) => {
    console.error('Crawler error', err);
  });

  return NextResponse.json({ jobId: job.id });
}
