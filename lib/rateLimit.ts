export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function politeWait(baseMs = 1200) {
  const jitter = Math.floor(Math.random() * 400);
  await delay(baseMs + jitter);
}
