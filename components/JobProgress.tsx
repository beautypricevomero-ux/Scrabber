'use client';

import { useEffect, useState } from 'react';
import type { JobStatus } from '../lib/types';

interface JobProgressProps {
  jobId: string;
  initialJob: JobStatus | null;
}

export default function JobProgress({ jobId, initialJob }: JobProgressProps) {
  const [job, setJob] = useState<JobStatus | null>(initialJob);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/crawl/status?jobId=${jobId}`);
        if (!response.ok) return;
        const data = (await response.json()) as JobStatus;
        setJob(data);
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  if (!job) {
    return <p className="text-sm text-rose-400">Job non trovato.</p>;
  }

  const completion = job.input.maxProducts === 0
    ? 0
    : Math.min(100, Math.round((job.products.length / job.input.maxProducts) * 100));

  return (
    <div className="card space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-400">Stato: {job.state}</p>
          <div className="mt-2 h-3 rounded-full bg-slate-800">
            <div
              className="h-3 rounded-full bg-indigo-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <a
            className="button-primary"
            href={`/api/crawl/download?jobId=${jobId}&format=csv`}
            onClick={() => setLoading(true)}
          >
            {loading ? 'Preparazione…' : 'Download CSV'}
          </a>
          <a
            className="button-primary"
            href={`/api/crawl/download?jobId=${jobId}&format=json`}
          >
            Download JSON
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        <Stat label="Prodotti salvati" value={job.products.length} />
        <Stat label="Errori" value={job.errors.length} />
        <Stat label="Max" value={job.input.maxProducts} />
        <Stat label="Ultimo aggiornamento" value={new Date(job.updatedAt).toLocaleTimeString()} />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white">Errori</h3>
        {job.errors.length === 0 ? (
          <p className="text-xs text-slate-400">Nessun errore segnalato.</p>
        ) : (
          <ul className="space-y-2 text-xs text-rose-300">
            {job.errors.map((err) => (
              <li key={`${err.message}-${err.at}`}>{err.message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-black/30 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
