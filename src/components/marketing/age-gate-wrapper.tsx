"use client";

import { useEffect, useState } from "react";
import { AGE_GATE_COOKIE_NAME } from "@/lib/constants";
import { AgeGateScreen } from "./age-gate-screen";
import { AgeGateSync } from "./age-gate-sync";

function readAgeVerified(): boolean {
  if (typeof document === "undefined") return false;
  try {
    if (document.cookie.includes(`${AGE_GATE_COOKIE_NAME}=true`)) return true;
    if (window.localStorage.getItem(AGE_GATE_COOKIE_NAME) === "true") return true;
  } catch {
    return false;
  }
  return false;
}

export function AgeGateWrapper({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    setVerified(readAgeVerified());
  }, []);

  const handleVerified = () => {
    try {
      window.localStorage.setItem(AGE_GATE_COOKIE_NAME, "true");
    } catch {
      // localStorage may be unavailable in private browsing
    }
    setVerified(true);
  };

  if (verified === null) {
    return null;
  }

  if (!verified) {
    return (
      <>
        <AgeGateSync onVerified={handleVerified} />
        <AgeGateScreen onVerified={handleVerified} />
      </>
    );
  }

  return <>{children}</>;
}
