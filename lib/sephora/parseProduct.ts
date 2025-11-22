import axios from 'axios';
import * as cheerio from 'cheerio';
import { selectors } from './selectors';
import { RawProduct } from '../types';
import { politeWait } from '../rateLimit';

function cleanText(input?: string | null) {
  return input ? input.replace(/\s+/g, ' ').trim() : '';
}

async function fetchHtml(url: string, dynamic: boolean): Promise<string> {
  if (dynamic) {
    try {
      const { chromium } = await import('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });
      await politeWait(800);
      const html = await page.content();
      await browser.close();
      return html;
    } catch (error) {
      console.warn('Dynamic rendering failed, falling back to static', error);
    }
  }
  const res = await axios.get(url, { timeout: 12000 });
  return res.data;
}

export async function parseProduct(url: string, dynamic: boolean): Promise<RawProduct> {
  const html = await fetchHtml(url, dynamic);
  const $ = cheerio.load(html);

  let jsonLd: any = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      if (parsed['@type'] === 'Product') {
        jsonLd = parsed;
      }
    } catch (e) {
      // ignore
    }
  });

  const title = cleanText(jsonLd?.name || $(selectors.titleSel).first().text());
  const vendor = cleanText(jsonLd?.brand?.name || $(selectors.brandSel).first().text());
  const price = jsonLd?.offers?.price || cleanText($(selectors.priceSel).first().text());
  const compareAtPrice = jsonLd?.offers?.priceSpecification?.referencePrice || cleanText($(selectors.comparePriceSel).first().text());
  const currency = jsonLd?.offers?.priceCurrency || '';
  const description = jsonLd?.description || $(selectors.descSel).html() || '';
  const ingredients = cleanText($(selectors.ingredientsSel).text());
  const ratingValue = jsonLd?.aggregateRating?.ratingValue || cleanText($(selectors.ratingSel).first().text());
  const reviewsCount = jsonLd?.aggregateRating?.reviewCount || cleanText($(selectors.reviewsCountSel).first().text());

  const images = new Set<string>();
  if (Array.isArray(jsonLd?.image)) {
    jsonLd.image.forEach((img: string) => images.add(img));
  }
  $(selectors.imageSel).each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src) images.add(src.startsWith('http') ? src : new URL(src, url).toString());
  });

  const tags: string[] = [];
  $('[data-at*=tag], .TagList li').each((_, el) => {
    tags.push(cleanText($(el).text()));
  });

  const handle = url.replace(/https?:\/\//, '').replace(/\W+/g, '-');

  const bodyHtml = description || '';

  const variants: RawProduct['variants'] = [];
  $('[data-at*=variant], [data-comp="ProductDetailSwatches"] [role=radio]').each((_, el) => {
    const value = cleanText($(el).text()) || cleanText($(el).attr('aria-label'));
    if (value) {
      variants.push({
        optionName: 'Shade',
        optionValue: value,
        price,
      });
    }
  });

  const product: RawProduct = {
    handle,
    title,
    vendor,
    productType: cleanText($('.Breadcrumb span').last().text()) || '',
    tags: Array.from(new Set(tags.filter(Boolean))),
    bodyHtml,
    imageSrc: Array.from(images),
    seoTitle: cleanText($('title').text()),
    seoDescription: cleanText($('meta[name="description"]').attr('content')),
    price,
    compareAtPrice,
    currency,
    size: '',
    variants: variants.length > 0 ? variants : undefined,
    sku: cleanText(jsonLd?.sku || $('[data-at*=sku]').text()),
    availability: cleanText(jsonLd?.offers?.availability || $('[data-at*=availability]').text()),
    ingredients,
    howToUse: cleanText($('[data-at*=how_to_use]').text()),
    claims: cleanText($('[data-at*=benefit]').text()),
    ratingsAverage: ratingValue,
    ratingsCount: cleanText(jsonLd?.aggregateRating?.ratingCount),
    reviewsCount: reviewsCount,
    url,
    timestamp: new Date().toISOString(),
  };

  ['title', 'vendor', 'price'].forEach((key) => {
    if (!(product as any)[key]) {
      console.warn(`Warning: missing ${key} for ${url}`);
    }
  });

  return product;
}
