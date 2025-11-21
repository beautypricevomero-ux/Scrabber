import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sephora Scraper to Shopify',
  description: 'Compliant Sephora crawler with Shopify CSV export',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="max-w-6xl mx-auto p-6">{children}</div>
      </body>
    </html>
  );
}
