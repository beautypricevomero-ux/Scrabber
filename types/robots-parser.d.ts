declare module 'robots-parser' {
  export interface Robots {
    isAllowed(url: string, userAgent?: string): boolean;
    isDisallowed(url: string, userAgent?: string): boolean;
    getCrawlDelay(userAgent?: string): number | undefined;
    getSitemaps(): string[];
  }

  export default function robotsParser(robotsUrl: string, robotsTxt: string): Robots;
}
