'use client';

import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function JobProgress({ jobId }: { jobId: string }) {
  const { data, error } = useSWR(`/api/crawl/status?id=${jobId}`, fetcher, {
    refreshInterval: 2000,
  });

  if (error) return <p className="text-red-600">Errore nel polling stato.</p>;
  if (!data) return <p>Caricamento stato...</p>;

  const { status } = data;
  const percent = status.totalFound
    ? Math.round((status.processed / status.totalFound) * 100)
    : status.state === 'completed'
      ? 100
      : 0;

  return (
    <div className="bg-white p-4 rounded border space-y-3">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Stato: {status.state}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
        <div className="bg-green-500 h-3" style={{ width: `${percent}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
        <div>Totale trovati: {status.totalFound}</div>
        <div>Processati: {status.processed}</div>
        <div>Rimanenti: {status.remaining}</div>
        <div>Errori: {status.errors?.length || 0}</div>
      </div>
      {status.notes && <p className="text-sm text-amber-700">Note: {status.notes}</p>}
      <div className="flex space-x-3">
        <Link href={`/jobs/${jobId}`} className="text-indigo-600 text-sm underline">
          Vai al dettaglio job
        </Link>
      </div>
    </div>
  );
}
