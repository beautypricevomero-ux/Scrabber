import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sephora.it Scraper → Shopify CSV',
  description: 'Internal tool to crawl Sephora.it product data and export Shopify-ready CSV.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-gray-800 bg-black/30">
          <div className="container flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight text-slate-100">
              Sephora.it Scraper → Shopify CSV
            </Link>
            <nav className="flex gap-4 text-sm text-slate-300">
              <Link href="/" className="hover:text-white">
                Dashboard
              </Link>
            </nav>
          </div>
        </header>
        <main className="container space-y-6 py-6">{children}</main>
      </body>
    </html>
  );
}
