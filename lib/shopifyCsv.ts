import { RawProduct } from './types';

const headers = [
  'Handle',
  'Title',
  'Body (HTML)',
  'Vendor',
  'Product Category',
  'Tags',
  'Published',
  'Option1 Name',
  'Option1 Value',
  'Variant SKU',
  'Variant Price',
  'Variant Compare At Price',
  'Variant Inventory Qty',
  'Variant Requires Shipping',
  'Variant Taxable',
  'Image Src',
  'Image Position',
  'SEO Title',
  'SEO Description'
];

export function toShopifyCsv(products: RawProduct[]): string {
  const rows: string[][] = [headers];
  products.forEach((p) => {
    const base = [
      p.handle,
      p.title,
      p.bodyHtml,
      p.vendor,
      p.productType,
      p.tags.join(','),
      'TRUE'
    ];

    if (p.variants && p.variants.length > 0) {
      p.variants.forEach((variant, idx) => {
        rows.push([
          ...base,
          variant.optionName || '',
          variant.optionValue || '',
          variant.sku || p.sku || '',
          variant.price || p.price || '',
          variant.compareAtPrice || p.compareAtPrice || '',
          '',
          'TRUE',
          'TRUE',
          variant.image || p.imageSrc[0] || '',
          String(idx + 1),
          p.seoTitle || '',
          p.seoDescription || ''
        ]);
      });
    } else {
      const images = p.imageSrc.length > 0 ? p.imageSrc : [''];
      images.forEach((img, idx) => {
        rows.push([
          ...base,
          '',
          '',
          p.sku || '',
          p.price || '',
          p.compareAtPrice || '',
          '',
          'TRUE',
          'TRUE',
          img,
          String(idx + 1),
          p.seoTitle || '',
          p.seoDescription || ''
        ]);
      });
    }
  });

  return rows.map((r) => r.map((v) => `"${(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
}
