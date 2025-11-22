import { buildRobotsChecker } from './robots';
import { discoverProductLinks } from './sephora/discover';
import { parseProduct } from './sephora/parseProduct';
import { appendError, appendRawProduct, readJob, updateJobStatus } from './storage';
import { PoliteLimiter } from './rateLimit';
import { ScrapeJobInput, JobStatus } from './types';

const BASE_URL = 'https://www.sephora.it';

export async function runCrawler(jobId: string, input: ScrapeJobInput): Promise<JobStatus | null> {
  await updateJobStatus(jobId, { state: 'running' });
  const limiter = new PoliteLimiter();
  const robots = await buildRobotsChecker(BASE_URL, input.startUrls);

  const discovered: string[] = [];
  for (const start of input.startUrls) {
    if (!robots.isAllowed(start)) {
      await appendError(jobId, { message: `Bloccato da robots.txt: ${start}`, at: new Date().toISOString() });
      continue;
    }
    try {
      const links = await discoverProductLinks(start, robots.isAllowed);
      for (const link of links) {
        if (!discovered.includes(link)) {
          discovered.push(link);
        }
      }
    } catch (err) {
      await appendError(jobId, {
        message: err instanceof Error ? err.message : 'Errore discover',
        at: new Date().toISOString()
      });
    }
  }

  const targets = discovered.slice(0, input.maxProducts);

  for (const url of targets) {
    if (!robots.isAllowed(url)) {
      await appendError(jobId, { message: `URL non consentita: ${url}`, at: new Date().toISOString() });
      continue;
    }

    let attempts = 0;
    let parsed = false;
    while (!parsed && attempts < 3) {
      attempts += 1;
      await limiter.waitTurn();
      try {
        const product = await parseProduct(url);
        await appendRawProduct(jobId, product);
        parsed = true;
      } catch (err) {
        const delay = attempts * 500;
        await appendError(jobId, {
          message: `Errore parsing (${attempts}/3) ${url}: ${err instanceof Error ? err.message : 'sconosciuto'}`,
          at: new Date().toISOString()
        });
        if (attempts < 3) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  const finalJob = await readJob(jobId);
  if (!finalJob) return null;
  const nextState: JobStatus['state'] = finalJob.errors.length > 0 && finalJob.products.length === 0 ? 'error' : 'completed';
  return updateJobStatus(jobId, { state: nextState });
}

