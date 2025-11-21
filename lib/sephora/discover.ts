import axios from 'axios';
import * as cheerio from 'cheerio';
import { selectors } from './selectors';
import { politeWait } from '../rateLimit';

export async function discoverProductLinks(url: string, dynamic = false): Promise<string[]> {
  // Dynamic rendering could be implemented with Playwright when needed.
  if (dynamic) {
    try {
      const { chromium } = await import('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });
      await politeWait(800);
      const links = await page.$$eval(selectors.productLink, (anchors) =>
        anchors.map((a) => (a as HTMLAnchorElement).href)
      );
      await browser.close();
      return Array.from(new Set(links));
    } catch (error) {
      console.warn('Dynamic discovery failed, falling back to static HTML', error);
    }
  }

  const res = await axios.get(url, { timeout: 10000 });
  const $ = cheerio.load(res.data);
  const links = new Set<string>();
  $(selectors.productLink).each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    const absolute = href.startsWith('http') ? href : new URL(href, url).toString();
    links.add(absolute.split('?')[0]);
  });
  return Array.from(links);
}
