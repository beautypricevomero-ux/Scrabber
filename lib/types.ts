export type JobRequest = {
  domain: string;
  startUrls: string[];
  maxProducts: number;
  dynamic: boolean;
  locale?: string;
};

export type RawVariant = {
  optionName?: string;
  optionValue?: string;
  price?: string;
  compareAtPrice?: string;
  sku?: string;
  image?: string;
  availability?: string;
};

export type RawProduct = {
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  bodyHtml: string;
  imageSrc: string[];
  seoTitle?: string;
  seoDescription?: string;
  price?: string;
  compareAtPrice?: string;
  currency?: string;
  size?: string;
  variants?: RawVariant[];
  sku?: string;
  availability?: string;
  ingredients?: string;
  howToUse?: string;
  claims?: string;
  ratingsAverage?: string;
  ratingsCount?: string;
  reviewsCount?: string;
  url: string;
  timestamp: string;
};

export type JobStatus = {
  id: string;
  startedAt: string;
  completedAt?: string;
  totalFound: number;
  processed: number;
  remaining: number;
  errors: { url: string; message: string }[];
  state: 'queued' | 'running' | 'completed' | 'blocked' | 'error';
  notes?: string;
  dynamic: boolean;
};

export type JobRecord = {
  request: JobRequest;
  status: JobStatus;
};
