import fs from 'fs';
import path from 'path';
import { JobRecord, RawProduct } from './types';

const baseDir = path.join(process.cwd(), 'data/jobs');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function jobDir(id: string) {
  const dir = path.join(baseDir, id);
  ensureDir(dir);
  return dir;
}

export function saveJobRecord(id: string, record: JobRecord) {
  ensureDir(baseDir);
  const file = path.join(baseDir, `${id}.json`);
  fs.writeFileSync(file, JSON.stringify(record, null, 2), 'utf-8');
}

export function listJobRecords(): JobRecord[] {
  ensureDir(baseDir);
  const files = fs.readdirSync(baseDir).filter((f) => f.endsWith('.json'));
  return files
    .map((file) => {
      const content = fs.readFileSync(path.join(baseDir, file), 'utf-8');
      return JSON.parse(content) as JobRecord;
    })
    .sort((a, b) => (a.status.startedAt < b.status.startedAt ? 1 : -1));
}

export function saveRawProduct(id: string, product: RawProduct) {
  const dir = jobDir(id);
  const file = path.join(dir, 'raw.json');
  const existing: RawProduct[] = fs.existsSync(file)
    ? (JSON.parse(fs.readFileSync(file, 'utf-8')) as RawProduct[])
    : [];
  existing.push(product);
  fs.writeFileSync(file, JSON.stringify(existing, null, 2), 'utf-8');
}

export function readRawProducts(id: string): RawProduct[] {
  const dir = jobDir(id);
  const file = path.join(dir, 'raw.json');
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as RawProduct[];
}

export function logError(id: string, url: string, message: string) {
  const dir = jobDir(id);
  const file = path.join(dir, 'errors.json');
  const existing: { url: string; message: string }[] = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf-8'))
    : [];
  existing.push({ url, message });
  fs.writeFileSync(file, JSON.stringify(existing, null, 2), 'utf-8');
}

export function readErrors(id: string) {
  const file = path.join(jobDir(id), 'errors.json');
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as { url: string; message: string }[];
}
