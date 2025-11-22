import JobProgress from '../../../components/JobProgress';
import { readJob } from '../../../lib/storage';

export const dynamic = 'force-dynamic';

interface JobPageProps {
  params: {
    jobId: string;
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const job = await readJob(params.jobId);

  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <h1 className="text-xl font-semibold text-white">Job {params.jobId}</h1>
        <p className="text-sm text-slate-400">
          Stato, errori e download dei dati raccolti da Sephora.it.
        </p>
      </div>
      <JobProgress jobId={params.jobId} initialJob={job} />
    </div>
  );
}
