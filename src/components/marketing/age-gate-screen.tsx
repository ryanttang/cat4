"use client";

import Link from "next/link";
import { useTransition } from "react";
import { confirmAgeVerificationAction } from "@/lib/actions/public";

type AgeGateScreenProps = {
  onVerified?: () => void;
};

export function AgeGateScreen({ onVerified }: AgeGateScreenProps) {
  const [pending, startTransition] = useTransition();

  function handleVerify() {
    startTransition(async () => {
      await confirmAgeVerificationAction();
      onVerified?.();
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-cat4-dark/95 backdrop-blur-sm">
      <div className="mx-auto max-w-md rounded-xl bg-cat4-surface p-8 text-center shadow-2xl">
        <span className="text-3xl font-bold text-cat4-blue">CAT4</span>
        <h1 className="mt-4 text-2xl font-bold text-cat4-light">Age Verification</h1>
        <p className="mt-3 text-cat4-light/70">
          You must be 21 years or older to enter this site. Please confirm your age to continue.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleVerify}
            disabled={pending}
            className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:w-auto"
          >
            {pending ? "Verifying…" : "I am 21 or older"}
          </button>
          <Link
            href="https://www.google.com"
            className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-base font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            I am under 21
          </Link>
        </div>
      </div>
    </div>
  );
}
