import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { jobDir, readErrors, readRawProducts } from '../../../lib/storage';
import { getJobStatus } from '../../../lib/crawler';

export default function JobPage({ params }: { params: { jobId: string } }) {
  const job = getJobStatus(params.jobId);
  if (!job) {
    return (
      <div className="space-y-2">
        <p className="text-red-600">Job non trovato.</p>
        <Link href="/" className="text-indigo-600 underline text-sm">
          Torna alla dashboard
        </Link>
      </div>
    );
  }
  const raw = readRawProducts(params.jobId);
  const errors = readErrors(params.jobId);
  const dir = jobDir(params.jobId);
  const csvPath = path.join(dir, 'products.shopify.csv');
  const jsonPath = path.join(dir, 'products.raw.json');

  const downloads = [
    fs.existsSync(csvPath) && { label: 'products.shopify.csv', path: `/api/crawl/download?id=${params.jobId}&type=csv` },
    fs.existsSync(jsonPath) && { label: 'products.raw.json', path: `/api/crawl/download?id=${params.jobId}&type=json` },
  ].filter(Boolean) as { label: string; path: string }[];

  return (
    <div className="space-y-4">
      <Link href="/" className="text-indigo-600 underline text-sm">
        ← Torna alla dashboard
      </Link>
      <div className="bg-white border rounded p-4 space-y-2">
        <h1 className="text-xl font-semibold">Job {params.jobId}</h1>
        <p className="text-sm text-gray-600">Stato: {job.status.state}</p>
        {job.status.notes && <p className="text-sm text-amber-700">Note: {job.status.notes}</p>}
        <div className="space-x-3">
          {downloads.map((d) => (
            <a key={d.label} className="text-sm text-indigo-600 underline" href={d.path}>
              Scarica {d.label}
            </a>
          ))}
        </div>
      </div>
      <div className="bg-white border rounded p-4">
        <h2 className="font-medium mb-2">Prodotti raccolti ({raw.length})</h2>
        <pre className="text-xs bg-gray-100 p-2 rounded max-h-72 overflow-auto">{JSON.stringify(raw.slice(0, 3), null, 2)}</pre>
        {raw.length > 3 && <p className="text-xs text-gray-500">Mostrate le prime 3 entry</p>}
      </div>
      <div className="bg-white border rounded p-4">
        <h2 className="font-medium mb-2">Errori ({errors.length})</h2>
        {errors.length === 0 ? (
          <p className="text-sm text-gray-600">Nessun errore registrato.</p>
        ) : (
          <ul className="text-sm list-disc list-inside space-y-1">
            {errors.map((e, idx) => (
              <li key={idx}>
                {e.url}: {e.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
