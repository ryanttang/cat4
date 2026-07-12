"use client";

import { useEffect, useState } from "react";

type PromotionCountdownProps = {
  endsAt: Date | string | null;
};

export function PromotionCountdown({ endsAt }: PromotionCountdownProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) return;

    function tick() {
      const end = new Date(endsAt!).getTime();
      setRemaining(Math.max(0, end - Date.now()));
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!endsAt || remaining === null) return null;

  if (remaining <= 0) {
    return (
      <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-red-400">
        This promotion has ended
      </p>
    );
  }

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  const units = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: seconds },
  ];

  return (
    <div className="mt-6 flex justify-center gap-3 sm:gap-4">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex min-w-[4rem] flex-col items-center rounded-lg bg-black/40 px-3 py-2 backdrop-blur-sm"
        >
          <span className="text-2xl font-bold tabular-nums text-cat4-light sm:text-3xl">
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="text-xs uppercase tracking-wider text-cat4-light/70">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
