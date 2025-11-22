import { RawProduct, ShopifyRow } from './types';

const HEADERS: Array<keyof ShopifyRow> = [
  'Handle',
  'Title',
  'Body (HTML)',
  'Vendor',
  'Product Type',
  'Tags',
  'Published',
  'Option1 Name',
  'Option1 Value',
  'Variant Price',
  'Variant Compare At Price',
  'Variant SKU',
  'Variant Inventory Qty',
  'Variant Requires Shipping',
  'Variant Taxable',
  'Image Src',
  'Image Position',
  'SEO Title',
  'SEO Description'
];

export function rawToRows(products: RawProduct[]): ShopifyRow[] {
  const rows: ShopifyRow[] = [];

  for (const product of products) {
    const base: Omit<ShopifyRow, 'Option1 Name' | 'Option1 Value' | 'Variant Price' | 'Variant Compare At Price' | 'Variant SKU' | 'Variant Inventory Qty' | 'Variant Requires Shipping' | 'Variant Taxable' | 'Image Src' | 'Image Position'> = {
      Handle: product.handle,
      Title: product.title,
      'Body (HTML)': product.bodyHtml ?? '',
      Vendor: product.vendor ?? '',
      'Product Type': product.productType ?? '',
      Tags: product.tags.join(', '),
      Published: 'TRUE',
      'SEO Title': product.seoTitle ?? '',
      'SEO Description': product.seoDescription ?? ''
    };

    if (product.variants.length > 0) {
      product.variants.forEach((variant, index) => {
        const row: ShopifyRow = {
          ...base,
          'Option1 Name': 'Title',
          'Option1 Value': variant.title,
          'Variant Price': variant.price !== null ? variant.price.toString() : '',
          'Variant Compare At Price': variant.compareAtPrice !== null ? variant.compareAtPrice.toString() : '',
          'Variant SKU': variant.sku ?? '',
          'Variant Inventory Qty': variant.available === false ? '0' : '',
          'Variant Requires Shipping': 'TRUE',
          'Variant Taxable': 'TRUE',
          'Image Src': product.images[0] ?? '',
          'Image Position': (index + 1).toString()
        };
        rows.push(row);
      });
    } else {
      const row: ShopifyRow = {
        ...base,
        'Option1 Name': 'Title',
        'Option1 Value': 'Default Title',
        'Variant Price': product.price !== null ? product.price.toString() : '',
        'Variant Compare At Price': product.compareAtPrice !== null ? product.compareAtPrice.toString() : '',
        'Variant SKU': product.sku ?? '',
        'Variant Inventory Qty': product.availability?.toLowerCase().includes('non') ? '0' : '',
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Image Src': product.images[0] ?? '',
        'Image Position': '1'
      };
      rows.push(row);
    }
  }

  return rows;
}

function escapeCsv(value: string): string {
  const needsQuotes = value.includes(',') || value.includes('"') || value.includes('\n');
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export function buildShopifyCsv(products: RawProduct[]): string {
  const rows = rawToRows(products);
  const headerLine = HEADERS.join(',');
  const body = rows
    .map((row) => HEADERS.map((key) => escapeCsv(row[key])).join(','))
    .join('\n');
  return `${headerLine}\n${body}`;
}
