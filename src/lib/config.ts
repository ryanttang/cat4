/** True when no DATABASE_URL is set, or USE_MOCK_DATA is explicitly enabled. */
export function isMockDataMode(): boolean {
  if (process.env.USE_MOCK_DATA === "true") return true;
  if (process.env.USE_MOCK_DATA === "false") return false;
  return !process.env.DATABASE_URL;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL) && !isMockDataMode();
}
