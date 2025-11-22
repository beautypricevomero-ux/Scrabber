import { NextResponse } from 'next/server';
import { readJob } from '../../../../lib/storage';
import { buildShopifyCsv } from '../../../../lib/shopifyCsv';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  const format = searchParams.get('format') ?? 'csv';

  if (!jobId) {
    return NextResponse.json({ error: 'jobId mancante' }, { status: 400 });
  }

  const job = await readJob(jobId);
  if (!job) {
    return NextResponse.json({ error: 'Job non trovato' }, { status: 404 });
  }

  if (format === 'json') {
    return new NextResponse(JSON.stringify(job.products, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${jobId}.json"`
      }
    });
  }

  const csv = buildShopifyCsv(job.products);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${jobId}.csv"`
    }
  });
}
