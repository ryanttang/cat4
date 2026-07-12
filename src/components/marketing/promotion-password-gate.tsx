"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { promotionAccessStorageKey } from "@/lib/promotion-utils";

type PromotionPasswordGateProps = {
  slug: string;
  passwordProtected: boolean;
  accessPassword: string;
  children: React.ReactNode;
};

export function PromotionPasswordGate({
  slug,
  passwordProtected,
  accessPassword,
  children,
}: PromotionPasswordGateProps) {
  const [unlocked, setUnlocked] = useState(!passwordProtected);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!passwordProtected) {
      setUnlocked(true);
      return;
    }

    const stored = sessionStorage.getItem(promotionAccessStorageKey(slug));
    setUnlocked(stored === "1");
  }, [passwordProtected, slug]);

  if (!passwordProtected || unlocked) {
    return <>{children}</>;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password === accessPassword) {
      sessionStorage.setItem(promotionAccessStorageKey(slug), "1");
      setUnlocked(true);
      setError("");
      return;
    }
    setError("Incorrect password. Please try again.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cat4-dark px-4 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-8"
      >
        <h1 className="text-2xl font-bold text-cat4-light">Password required</h1>
        <p className="mt-2 text-sm text-cat4-light/70">
          Enter the promotion password to continue.
        </p>
        <div className="mt-6">
          <Label htmlFor="promotion-password" className="text-cat4-light">
            Password
          </Label>
          <Input
            id="promotion-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1"
            autoFocus
          />
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" className="mt-6 w-full">
          Continue
        </Button>
      </form>
    </div>
  );
}
