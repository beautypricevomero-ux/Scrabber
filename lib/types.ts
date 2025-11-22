export interface ScrapeJobInput {
  startUrls: string[];
  maxProducts: number;
}

export type JobState = 'pending' | 'running' | 'completed' | 'error';

export interface RawProductVariant {
  title: string;
  price: number | null;
  compareAtPrice: number | null;
  sku: string | null;
  available: boolean | null;
}

export interface RawProduct {
  handle: string;
  title: string;
  vendor: string | null;
  productType: string | null;
  tags: string[];
  bodyHtml: string | null;
  images: string[];
  price: number | null;
  compareAtPrice: number | null;
  currency: string;
  variants: RawProductVariant[];
  sku: string | null;
  availability: string | null;
  ingredients: string | null;
  howToUse: string | null;
  ratingsAverage: number | null;
  ratingsCount: number | null;
  reviewsCount: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
  sourceUrl: string;
  crawledAt: string;
}

export interface JobError {
  message: string;
  at: string;
}

export interface JobStatus {
  id: string;
  input: ScrapeJobInput;
  state: JobState;
  products: RawProduct[];
  errors: JobError[];
  createdAt: string;
  updatedAt: string;
}

export interface ShopifyRow {
  Handle: string;
  Title: string;
  'Body (HTML)': string;
  Vendor: string;
  'Product Type': string;
  Tags: string;
  Published: string;
  'Option1 Name': string;
  'Option1 Value': string;
  'Variant Price': string;
  'Variant Compare At Price': string;
  'Variant SKU': string;
  'Variant Inventory Qty': string;
  'Variant Requires Shipping': string;
  'Variant Taxable': string;
  'Image Src': string;
  'Image Position': string;
  'SEO Title': string;
  'SEO Description': string;
}
