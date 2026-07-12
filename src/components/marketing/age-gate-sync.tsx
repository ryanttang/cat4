"use client";

import { useEffect } from "react";
import { confirmAgeVerificationAction } from "@/lib/actions/public";
import { AGE_GATE_COOKIE_NAME } from "@/lib/constants";

type AgeGateSyncProps = {
  onVerified?: () => void;
};

/** Syncs prior localStorage verification into the server cookie on return visits. */
export function AgeGateSync({ onVerified }: AgeGateSyncProps) {
  useEffect(() => {
    let stored = false;

    try {
      stored = window.localStorage.getItem(AGE_GATE_COOKIE_NAME) === "true";
    } catch {
      stored = false;
    }

    if (!stored) return;

    void confirmAgeVerificationAction().then(() => {
      onVerified?.();
    });
  }, [onVerified]);

  return null;
}
