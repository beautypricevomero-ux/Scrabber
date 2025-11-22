import axios from 'axios';
import * as cheerio from 'cheerio';
import { selectors } from './selectors';
import { RawProduct, RawProductVariant } from '../types';

function cleanText(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim();
}

function safeNumber(value: string | number | null | undefined): number | null {
  if (value === undefined || value === null) return null;
  const num = typeof value === 'number' ? value : Number((value as string).replace(/[^0-9.,]/g, '').replace(',', '.'));
  return Number.isFinite(num) ? num : null;
}

function parseJsonLd($: cheerio.CheerioAPI) {
  const scripts = $('script[type="application/ld+json"]');
  const products: Record<string, unknown>[] = [];
  scripts.each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown> | Record<string, unknown>[];
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (item['@type'] === 'Product') {
            products.push(item);
          }
        });
      } else if (parsed['@type'] === 'Product') {
        products.push(parsed);
      } else if (Array.isArray(parsed['@graph'])) {
        (parsed['@graph'] as Record<string, unknown>[]).forEach((node) => {
          if (node['@type'] === 'Product') {
            products.push(node);
          }
        });
      }
    } catch {
      // ignore malformed json-ld
    }
  });
  return products[0];
}

export async function parseProduct(url: string): Promise<RawProduct> {
  const response = await axios.get(url, { timeout: 20000 });
  const $ = cheerio.load(response.data);
  const jsonLd = parseJsonLd($) ?? {};

  const title = cleanText((jsonLd.name as string | undefined) ?? selectors.title.map((sel) => cleanText($(sel).first().text())).find((val) => val.length > 0));
  const brand = cleanText((jsonLd.brand as { name?: string } | undefined)?.name ?? selectors.brand.map((sel) => cleanText($(sel).first().text())).find((val) => val.length > 0));
  const description = (jsonLd.description as string | undefined) ?? selectors.description.map((sel) => $(sel).first().html()).find((val) => val && val.length > 0) ?? null;
  const images: string[] = [];

  const jsonImages = (jsonLd.image as string[] | string | undefined) ?? [];
  if (Array.isArray(jsonImages)) {
    jsonImages.forEach((img) => {
      if (typeof img === 'string' && img.length > 0 && !images.includes(img)) {
        images.push(img);
      }
    });
  } else if (typeof jsonImages === 'string' && jsonImages.length > 0) {
    images.push(jsonImages);
  }

  selectors.image.forEach((sel) => {
    $(sel).each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !images.includes(src)) {
        images.push(src);
      }
      return;
    });
  });

  const price = safeNumber((jsonLd.offers as { price?: string } | undefined)?.price ?? selectors.price.map((sel) => cleanText($(sel).first().text())).find((val) => val.length > 0));
  const compareAtPrice = safeNumber((jsonLd.offers as { priceSpecification?: { price?: string } } | undefined)?.priceSpecification?.price ?? selectors.comparePrice.map((sel) => cleanText($(sel).first().text())).find((val) => val.length > 0));

  const category = cleanText((jsonLd.category as string | undefined) ?? selectors.category.map((sel) => cleanText($(sel).first().text())).find((val) => val.length > 0));
  const tags: string[] = [];
  selectors.tagList.forEach((sel) => {
    $(sel).each((_, el) => {
      const text = cleanText($(el).text());
      if (text.length > 0) {
        tags.push(text);
      }
      return;
    });
  });

  const availability = cleanText(
    (jsonLd.offers as { availability?: string } | undefined)?.availability ??
      selectors.availability.map((sel) => cleanText($(sel).first().text())).find((val) => val.length > 0)
  );

  const ingredients = selectors.ingredients
    .map((sel) => cleanText($(sel).first().text()))
    .find((val) => val.length > 0) || null;

  const howToUse = selectors.howToUse
    .map((sel) => cleanText($(sel).first().text()))
    .find((val) => val.length > 0) || null;

  const ratingsAverage = safeNumber(
    (jsonLd.aggregateRating as { ratingValue?: string } | undefined)?.ratingValue ??
      selectors.ratingValue.map((sel) => $(sel).first().attr('content') ?? cleanText($(sel).first().text())).find((val) => (val?.length ?? 0) > 0)
  );

  const ratingsCount = safeNumber(
    (jsonLd.aggregateRating as { ratingCount?: string } | undefined)?.ratingCount ??
      selectors.ratingCount.map((sel) => $(sel).first().attr('content') ?? cleanText($(sel).first().text())).find((val) => (val?.length ?? 0) > 0)
  );

  const reviewsCount = safeNumber(
    selectors.reviewCount.map((sel) => cleanText($(sel).first().text())).find((val) => val.length > 0)
  );

  const seoTitle = cleanText(selectors.seoTitle.map((sel) => $(sel).first().text()).find((val) => val.length > 0) ?? (jsonLd.name as string | undefined));
  const seoDescription = cleanText(
    selectors.seoDescription
      .map((sel) => $(sel).first().attr('content') ?? '')
      .find((val) => val.length > 0) ?? (jsonLd.description as string | undefined)
  );

  const variants: RawProductVariant[] = [];
  const jsonOffers = jsonLd.offers as { offers?: Array<Record<string, unknown>> } | undefined;
  if (jsonOffers && Array.isArray(jsonOffers.offers)) {
    jsonOffers.offers.forEach((offer) => {
      const title = cleanText((offer.name as string | undefined) ?? 'Variante');
      const variant: RawProductVariant = {
        title,
        price: safeNumber(offer.price as string | undefined),
        compareAtPrice: safeNumber((offer.priceSpecification as { price?: string } | undefined)?.price),
        sku: (offer.sku as string | undefined) ?? null,
        available: typeof offer.availability === 'string' ? !offer.availability.includes('OutOfStock') : null
      };
      variants.push(variant);
    });
  }

  selectors.variant.forEach((sel) => {
    $(sel).each((_, el) => {
      const text = cleanText($(el).text());
      if (text.length > 0) {
        variants.push({
          title: text,
          price,
          compareAtPrice,
          sku: null,
          available: null
        });
      }
      return;
    });
  });

  const handle = url.split('/').filter(Boolean).pop() ?? crypto.randomUUID();

  const product: RawProduct = {
    handle,
    title,
    vendor: brand || null,
    productType: category || null,
    tags,
    bodyHtml: description,
    images: images.length > 0 ? images : ['https://www.sephora.it'],
    price,
    compareAtPrice,
    currency: 'EUR',
    variants,
    sku: null,
    availability: availability || null,
    ingredients,
    howToUse,
    ratingsAverage,
    ratingsCount,
    reviewsCount,
    seoTitle: seoTitle || null,
    seoDescription: seoDescription || null,
    sourceUrl: url,
    crawledAt: new Date().toISOString()
  };

  return product;
}
