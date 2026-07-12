"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subscribeAction } from "@/lib/actions/public";
import { brand } from "@/lib/brand";

type SubscribeSectionProps = {
  source?: string;
  compact?: boolean;
};

export function SubscribeSection({ source = "homepage", compact = false }: SubscribeSectionProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const result = await subscribeAction({
      email,
      firstName: firstName || undefined,
      consentMarketing: consent as true,
      source,
    });

    if (result.success) {
      setStatus("success");
      setEmail("");
      setFirstName("");
      setConsent(false);
    } else {
      setStatus("error");
      setErrorMsg(result.error ?? "Something went wrong");
    }
  }

  return (
    <section className={compact ? "py-12" : "bg-cat4-blue py-20"}>
      <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
        <h2 className={`text-3xl font-bold tracking-tight text-cat4-light`}>
          Stay in the Loop
        </h2>
        <p className={`mt-3 text-cat4-light/80`}>
          Get updates on new products, events, and exclusive offers.
        </p>

        {status === "success" ? (
          <p className={`mt-6 text-lg font-medium text-cat4-light`}>
            Thanks for subscribing!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
            {!compact && (
              <div>
                <Label htmlFor="firstName" className="text-cat4-light">
                  First Name (optional)
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 bg-white"
                  placeholder="Your first name"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-cat4-light">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-white"
                placeholder="you@example.com"
              />
            </div>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
                required
              />
              <span className={`text-xs text-cat4-light/80`}>
                {brand.defaults.marketingConsent}
              </span>
            </label>
            {status === "error" && <p className="text-sm text-red-300">{errorMsg}</p>}
            <Button
              type="submit"
              disabled={status === "loading"}
              variant={compact ? "default" : "secondary"}
              className="w-full"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
