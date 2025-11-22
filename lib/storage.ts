import { promises as fs } from 'fs';
import path from 'path';
import { RawProduct, JobStatus, ScrapeJobInput, JobError } from './types';

const JOBS_ROOT = path.join(process.cwd(), 'data', 'jobs');

async function ensureJobDir(jobId: string) {
  await fs.mkdir(path.join(JOBS_ROOT, jobId), { recursive: true });
}

async function writeJson(filePath: string, data: unknown) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function createJob(input: ScrapeJobInput): Promise<JobStatus> {
  await fs.mkdir(JOBS_ROOT, { recursive: true });
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const status: JobStatus = {
    id,
    input,
    state: 'pending',
    products: [],
    errors: [],
    createdAt: now,
    updatedAt: now
  };

  await ensureJobDir(id);
  await writeJson(path.join(JOBS_ROOT, id, 'status.json'), status);
  await writeJson(path.join(JOBS_ROOT, id, 'raw.json'), []);
  await writeJson(path.join(JOBS_ROOT, id, 'errors.json'), []);

  return status;
}

export async function updateJobStatus(jobId: string, partial: Partial<JobStatus>): Promise<JobStatus | null> {
  const current = await readJob(jobId);
  if (!current) return null;
  const next: JobStatus = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString()
  };
  await writeJson(path.join(JOBS_ROOT, jobId, 'status.json'), next);
  return next;
}

export async function appendRawProduct(jobId: string, product: RawProduct): Promise<void> {
  const rawPath = path.join(JOBS_ROOT, jobId, 'raw.json');
  const rawData = await fs.readFile(rawPath, 'utf8').catch(async () => {
    await writeJson(rawPath, []);
    return '[]';
  });
  const list = JSON.parse(rawData) as RawProduct[];
  list.push(product);
  await writeJson(rawPath, list);

  const status = await readJob(jobId);
  if (status) {
    status.products.push(product);
    await writeJson(path.join(JOBS_ROOT, jobId, 'status.json'), {
      ...status,
      updatedAt: new Date().toISOString()
    });
  }
}

export async function appendError(jobId: string, error: JobError): Promise<void> {
  const errorPath = path.join(JOBS_ROOT, jobId, 'errors.json');
  const content = await fs.readFile(errorPath, 'utf8').catch(async () => {
    await writeJson(errorPath, []);
    return '[]';
  });
  const list = JSON.parse(content) as JobError[];
  list.push(error);
  await writeJson(errorPath, list);

  const status = await readJob(jobId);
  if (status) {
    status.errors.push(error);
    await writeJson(path.join(JOBS_ROOT, jobId, 'status.json'), {
      ...status,
      updatedAt: new Date().toISOString()
    });
  }
}

export async function readJob(jobId: string): Promise<JobStatus | null> {
  try {
    const data = await fs.readFile(path.join(JOBS_ROOT, jobId, 'status.json'), 'utf8');
    return JSON.parse(data) as JobStatus;
  } catch {
    return null;
  }
}

export async function listJobs(): Promise<JobStatus[]> {
  try {
    const entries = await fs.readdir(JOBS_ROOT, { withFileTypes: true });
    const jobs: JobStatus[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const job = await readJob(entry.name);
      if (job) jobs.push(job);
    }
    return jobs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return [];
  }
}
