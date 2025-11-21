import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { jobDir } from '../../../../lib/storage';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');
  if (!id || !type) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  const fileName = type === 'csv' ? 'products.shopify.csv' : 'products.raw.json';
  const filePath = path.join(jobDir(id), fileName);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'File non pronto' }, { status: 404 });
  const data = fs.readFileSync(filePath);
  const headers = new Headers({
    'Content-Type': type === 'csv' ? 'text/csv' : 'application/json',
    'Content-Disposition': `attachment; filename="${fileName}"`,
  });
  return new NextResponse(data, { headers });
}
