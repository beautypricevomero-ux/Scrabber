import { v4 as uuidv4 } from 'uuid';
import { buildRobotsChecker } from './robots';
import { discoverProductLinks } from './sephora/discover';
import { parseProduct } from './sephora/parseProduct';
import { JobRequest, JobRecord, JobStatus, RawProduct } from './types';
import { jobDir, logError, readErrors, readRawProducts, saveJobRecord, saveRawProduct } from './storage';
import { politeWait } from './rateLimit';
import { toShopifyCsv } from './shopifyCsv';
import fs from 'fs';
import path from 'path';

const jobMap = new Map<string, JobRecord>();

export async function startJob(request: JobRequest) {
  const id = uuidv4();
  const status: JobStatus = {
    id,
    startedAt: new Date().toISOString(),
    totalFound: 0,
    processed: 0,
    remaining: 0,
    errors: [],
    state: 'queued',
    dynamic: request.dynamic,
  };

  const record: JobRecord = { request, status };
  jobMap.set(id, record);
  saveJobRecord(id, record);

  runJob(id).catch((error) => {
    const current = jobMap.get(id);
    if (current) {
      current.status.state = 'error';
      current.status.notes = String(error);
      saveJobRecord(id, current);
    }
  });

  return id;
}

export function getJobStatus(id: string): JobRecord | null {
  const fromMap = jobMap.get(id);
  if (fromMap) return fromMap;
  try {
    const file = fs.readFileSync(path.join(jobDir(id), '..', `${id}.json`), 'utf-8');
    return JSON.parse(file) as JobRecord;
  } catch (e) {
    return null;
  }
}

async function runJob(id: string) {
  const record = jobMap.get(id);
  if (!record) return;
  const { request, status } = record;

  status.state = 'running';
  saveJobRecord(id, record);

  const robots = await buildRobotsChecker(request.domain);
  const disallowedStarts = request.startUrls.filter((u) => !robots.isAllowed(u));
  console.info('Robots.txt fetched. Disallowed:', disallowedStarts);
  if (disallowedStarts.length > 0) {
    status.notes = `Blocchi robots.txt: ${disallowedStarts.join(', ')}`;
  }
  if (disallowedStarts.length === request.startUrls.length) {
    status.state = 'blocked';
    status.notes = 'All start URLs blocked by robots.txt. Use feed or official APIs.';
    saveJobRecord(id, record);
    return;
  }

  const allowedStartUrls = request.startUrls.filter((u) => robots.isAllowed(u));

  const productUrls = new Set<string>();
  for (const url of allowedStartUrls) {
    try {
      const links = await discoverProductLinks(url, request.dynamic);
      links.forEach((l) => {
        if (robots.isAllowed(l)) {
          productUrls.add(l);
        }
      });
    } catch (e) {
      status.errors.push({ url, message: 'Discovery failed' });
      logError(id, url, 'Discovery failed');
    }
  }

  const urls = Array.from(productUrls).slice(0, request.maxProducts);
  status.totalFound = urls.length;
  status.remaining = urls.length;
  saveJobRecord(id, record);

  for (const url of urls) {
    if (!robots.isAllowed(url)) {
      status.errors.push({ url, message: 'Blocked by robots.txt' });
      logError(id, url, 'Blocked by robots.txt');
      continue;
    }
    try {
      const product = await parseProduct(url, request.dynamic);
      saveRawProduct(id, product);
      status.processed += 1;
      status.remaining = Math.max(0, status.totalFound - status.processed);
      saveJobRecord(id, record);
    } catch (error) {
      status.errors.push({ url, message: 'Parsing failed' });
      logError(id, url, String(error));
    }
    await politeWait();
  }

  const rawProducts = readRawProducts(id);
  const csv = toShopifyCsv(rawProducts);
  const dir = jobDir(id);
  fs.writeFileSync(path.join(dir, 'products.shopify.csv'), csv, 'utf-8');
  fs.writeFileSync(path.join(dir, 'products.raw.json'), JSON.stringify(rawProducts, null, 2), 'utf-8');

  status.completedAt = new Date().toISOString();
  status.state = status.errors.length > 0 ? 'completed' : 'completed';
  status.errors = readErrors(id);
  saveJobRecord(id, record);
}
