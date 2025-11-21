'use client';

import { useState } from 'react';
import AdminForm, { AdminFormValues } from './AdminForm';
import JobProgress from './JobProgress';

export default function ClientDashboard() {
  const [currentJob, setCurrentJob] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startJob = async (values: AdminFormValues) => {
    if (values.adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      setError('Admin key errata.');
      return;
    }
    setError(null);
    const resp = await fetch('/api/crawl/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': values.adminKey },
      body: JSON.stringify({
        domain: values.domain,
        startUrls: values.startUrls
          .split(/\n+/)
          .map((s) => s.trim())
          .filter(Boolean),
        maxProducts: values.maxProducts,
        dynamic: values.dynamic,
        locale: values.locale,
      }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      setError(data.error || 'Errore avvio job');
      return;
    }
    setCurrentJob(data.id);
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <AdminForm onSubmit={startJob} />
      {currentJob && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Job corrente</h2>
          <JobProgress jobId={currentJob} />
        </div>
      )}
    </div>
  );
}
