import Link from 'next/link';
import clsx from 'clsx';
import type { JobStatus } from '../lib/types';

interface JobListProps {
  jobs: JobStatus[];
}

const statusLabel: Record<JobStatus['state'], string> = {
  pending: 'In coda',
  running: 'In esecuzione',
  completed: 'Completato',
  error: 'Errore'
};

export default function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return <p className="text-sm text-slate-400">Nessun job creato.</p>;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Job recenti</h2>
      <div className="divide-y divide-gray-800 rounded-lg border border-gray-800">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="flex items-center justify-between bg-black/20 px-4 py-3 transition hover:bg-black/40"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">{job.id}</p>
              <p className="text-xs text-slate-400">
                Prodotti: {job.products.length} · Errori: {job.errors.length} · Max: {job.input.maxProducts}
              </p>
            </div>
            <span
              className={clsx('badge', {
                'border-emerald-500/50 text-emerald-300': job.state === 'completed',
                'border-amber-500/50 text-amber-300': job.state === 'running',
                'border-slate-500/50 text-slate-300': job.state === 'pending',
                'border-rose-500/50 text-rose-300': job.state === 'error'
              })}
            >
              {statusLabel[job.state]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
