import Link from 'next/link';
import { listJobRecords } from '../lib/storage';

export default function JobList() {
  const jobs = listJobRecords();
  if (jobs.length === 0) return <p className="text-sm text-gray-600">Nessun job ancora.</p>;

  return (
    <div className="space-y-2">
      {jobs.map((job) => (
        <div key={job.status.id} className="bg-white p-3 rounded border flex justify-between items-center">
          <div>
            <p className="font-medium">Job {job.status.id}</p>
            <p className="text-sm text-gray-600">Stato: {job.status.state} · Iniziato: {job.status.startedAt}</p>
          </div>
          <Link className="text-indigo-600 text-sm underline" href={`/jobs/${job.status.id}`}>
            Dettaglio
          </Link>
        </div>
      ))}
    </div>
  );
}
