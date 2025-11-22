import axios from 'axios';
import * as cheerio from 'cheerio';
import { selectors } from './selectors';

const PRODUCT_REGEX = /\/p\//;

export async function discoverProductLinks(startUrl: string, isAllowed: (url: string) => boolean): Promise<string[]> {
  const response = await axios.get(startUrl, { timeout: 15000 });
  const $ = cheerio.load(response.data);
  const links: string[] = [];

  selectors.productLink.forEach((sel) => {
    $(sel).each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      const absolute = buildAbsolute(href);
      if (absolute && PRODUCT_REGEX.test(absolute) && isAllowed(absolute)) {
        if (!links.includes(absolute)) {
          links.push(absolute);
        }
      }
    });
  });

  $('a').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    const absolute = buildAbsolute(href);
    if (!absolute) return;
    if (PRODUCT_REGEX.test(absolute) && isAllowed(absolute)) {
      if (!links.includes(absolute)) {
        links.push(absolute);
      }
    }
  });

  return links;
}

function buildAbsolute(href: string): string | null {
  if (href.startsWith('http')) return href;
  if (href.startsWith('//')) return `https:${href}`;
  if (href.startsWith('/')) return `https://www.sephora.it${href}`;
  return null;
}
