const baseDelay = 1500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class PoliteLimiter {
  private lastRun = 0;

  async waitTurn() {
    const now = Date.now();
    const jitter = Math.floor(Math.random() * 400);
    const elapsed = now - this.lastRun;
    const waitTime = elapsed >= baseDelay ? 0 : baseDelay - elapsed;
    this.lastRun = now + waitTime + jitter;
    await sleep(waitTime + jitter);
  }
}
