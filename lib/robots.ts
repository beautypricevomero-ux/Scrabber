import axios from 'axios';

interface RobotsRule {
  type: 'allow' | 'disallow';
  path: string;
}

export async function buildRobotsChecker(baseUrl: string, allowedSeeds: string[] = []) {
  const rules: RobotsRule[] = [];
  let safeMode = false;

  try {
    const response = await axios.get(`${baseUrl.replace(/\/$/, '')}/robots.txt`, {
      timeout: 8000
    });
    const lines = response.data.split(/\r?\n/);
    let applies = false;
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      if (/^User-agent:/i.test(line)) {
        const agent = line.split(':')[1]?.trim() ?? '';
        applies = agent === '*' || agent === 'SephoraScraper';
      }
      if (!applies) continue;
      if (/^Allow:/i.test(line)) {
        const path = line.split(':')[1]?.trim() ?? '/';
        rules.push({ type: 'allow', path });
      }
      if (/^Disallow:/i.test(line)) {
        const path = line.split(':')[1]?.trim() ?? '/';
        rules.push({ type: 'disallow', path });
      }
    }
  } catch (err) {
    console.warn('Robots.txt non raggiungibile, safe mode attivo', err);
    safeMode = true;
  }

  const allowedSeedsNormalized = allowedSeeds.map((url) => url.replace(/\/$/, ''));

  const isAllowed = (targetUrl: string): boolean => {
    if (!targetUrl.startsWith(baseUrl)) return false;
    if (safeMode) {
      return allowedSeedsNormalized.some((seed) => targetUrl.startsWith(seed));
    }

    const pathname = new URL(targetUrl).pathname;
    let selectedRule: RobotsRule | null = null;

    for (const rule of rules) {
      if (rule.path === '') continue;
      if (pathname.startsWith(rule.path)) {
        if (!selectedRule || rule.path.length > selectedRule.path.length) {
          selectedRule = rule;
        }
      }
    }

    if (!selectedRule) return true;
    return selectedRule.type === 'allow';
  };

  return { isAllowed };
}
