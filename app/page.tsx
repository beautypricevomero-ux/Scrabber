import AdminForm from '../components/AdminForm';
import JobList from '../components/JobList';
import { listJobs } from '../lib/storage';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const jobs = await listJobs();

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-indigo-300">Admin</p>
            <h1 className="text-2xl font-semibold text-white">Sephora.it Scraper → Shopify CSV</h1>
            <p className="text-sm text-slate-400">
              Inserisci URL di categoria o collezione Sephora.it per generare un CSV compatibile Shopify.
            </p>
          </div>
        </div>
        <AdminForm />
      </div>

      <div className="card">
        <JobList jobs={jobs} />
      </div>
    </div>
  );
}
