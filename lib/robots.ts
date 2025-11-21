import axios from 'axios';
import robotsParser from 'robots-parser';

export async function buildRobotsChecker(domain: string) {
  const robotsUrl = new URL('/robots.txt', domain).toString();
  try {
    const res = await axios.get(robotsUrl, { timeout: 8000 });
    const parser = robotsParser(robotsUrl, res.data);
    const isAllowed = (url: string) => parser.isAllowed(url, 'SephoraShopifyScraper/1.0');
    return { isAllowed, content: res.data };
  } catch (error) {
    console.warn('Robots.txt could not be fetched, defaulting to allow none for safety', error);
    return { isAllowed: () => false, content: '' };
  }
}
