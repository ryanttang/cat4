import { isLocalMockMode } from "@/lib/data/shared";

export function MockModeBanner() {
  if (!isLocalMockMode()) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-200">
      <strong>Local design mode</strong> — using in-memory mock data. Changes reset on server restart.
      {" "}Set <code className="rounded bg-amber-500/20 px-1 text-amber-100">DATABASE_URL</code> in{" "}
      <code className="rounded bg-amber-500/20 px-1 text-amber-100">.env.local</code> when ready for Neon.
    </div>
  );
}
