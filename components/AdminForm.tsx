'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ScrapeJobInput } from '../lib/types';

export default function AdminForm() {
  const router = useRouter();
  const [startUrls, setStartUrls] = useState('https://www.sephora.it/c/profumi');
  const [maxProducts, setMaxProducts] = useState<number>(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload: ScrapeJobInput = {
      startUrls: startUrls
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0),
      maxProducts
    };

    try {
      const response = await fetch('/api/crawl/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = await response.json();
        setError(body.error ?? 'Errore avvio job');
        return;
      }

      const data = (await response.json()) as { jobId: string };
      router.push(`/jobs/${data.jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white" htmlFor="startUrls">
          URL di partenza (uno per riga)
        </label>
        <textarea
          id="startUrls"
          className="w-full rounded-lg border border-gray-700 bg-black/40 p-3 text-sm focus:border-indigo-400 focus:outline-none"
          rows={4}
          value={startUrls}
          onChange={(e) => setStartUrls(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white" htmlFor="maxProducts">
            Max prodotti
          </label>
          <input
            id="maxProducts"
            type="number"
            min={1}
            max={500}
            className="w-full rounded-lg border border-gray-700 bg-black/40 p-3 text-sm focus:border-indigo-400 focus:outline-none"
            value={maxProducts}
            onChange={(e) => setMaxProducts(Number(e.target.value))}
            required
          />
        </div>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <button type="submit" className="button-primary" disabled={loading}>
        {loading ? 'Avvio…' : 'Start scraping'}
      </button>
    </form>
  );
}
