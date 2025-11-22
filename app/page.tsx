import ClientDashboard from '../components/ClientDashboard';
import JobList from '../components/JobList';

export default function Page() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Sephora → Shopify Scraper (compliant)</h1>
        <p className="text-sm text-gray-600">
          Crawling solo pagine pubbliche consentite. Rispetta robots.txt, rate-limit e blocca sezioni non
          autorizzate. Sezione non consentita / protetta; usare feed o API ufficiali/partner.
        </p>
      </header>
      <ClientDashboard />
      <div>
        <h2 className="text-lg font-semibold mb-2">Job precedenti</h2>
        <JobList />
      </div>
    </div>
  );
}
