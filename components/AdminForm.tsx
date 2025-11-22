'use client';

import { useState } from 'react';

export type AdminFormValues = {
  domain: string;
  startUrls: string;
  maxProducts: number;
  dynamic: boolean;
  locale: string;
  adminKey: string;
};

export default function AdminForm({ onSubmit }: { onSubmit: (values: AdminFormValues) => Promise<void> }) {
  const [values, setValues] = useState<AdminFormValues>({
    domain: 'https://www.sephora.it',
    startUrls: '',
    maxProducts: 20,
    dynamic: false,
    locale: 'it-IT',
    adminKey: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    await onSubmit(values);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded p-4 space-y-4 border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block text-sm font-medium text-gray-700">
          Dominio Sephora
          <input
            type="url"
            value={values.domain}
            onChange={(e) => setValues({ ...values, domain: e.target.value })}
            className="mt-1 block w-full rounded border-gray-300"
            required
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Max prodotti
          <input
            type="number"
            value={values.maxProducts}
            onChange={(e) => setValues({ ...values, maxProducts: Number(e.target.value) })}
            className="mt-1 block w-full rounded border-gray-300"
            min={1}
            max={300}
            required
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Locale / lingua
          <input
            type="text"
            value={values.locale}
            onChange={(e) => setValues({ ...values, locale: e.target.value })}
            className="mt-1 block w-full rounded border-gray-300"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Admin key (env)
          <input
            type="password"
            value={values.adminKey}
            onChange={(e) => setValues({ ...values, adminKey: e.target.value })}
            className="mt-1 block w-full rounded border-gray-300"
            placeholder="Imposta NEXT_PUBLIC_ADMIN_KEY"
            required
          />
        </label>
      </div>
      <label className="block text-sm font-medium text-gray-700">
        URLs categoria/listing (una per riga)
        <textarea
          value={values.startUrls}
          onChange={(e) => setValues({ ...values, startUrls: e.target.value })}
          className="mt-1 block w-full rounded border-gray-300"
          rows={4}
          placeholder="https://www.sephora.it/c/trucco/"
        />
      </label>
      <div className="flex items-center space-x-3">
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={values.dynamic}
            onChange={(e) => setValues({ ...values, dynamic: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span>Dynamic rendering (Playwright)</span>
        </label>
        {values.dynamic && <span className="text-xs text-gray-500">Usa solo se consentito e necessario.</span>}
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Avvio…' : 'Avvia job'}
      </button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </form>
  );
}
