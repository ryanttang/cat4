"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { subscribeAction } from "@/lib/actions/public";
import { brand } from "@/lib/brand";

type LinksSubscribeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
};

export function LinksSubscribeModal({
  open,
  onOpenChange,
  title,
  body,
}: LinksSubscribeModalProps) {
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
      source: "links",
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

  function handleOpenChange(next: boolean) {
    if (!next) {
      setStatus("idle");
      setErrorMsg("");
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md border-cat4-blue/20 bg-cat4-dark text-cat4-light">
        <DialogHeader>
          <DialogTitle className="text-cat4-light">{title}</DialogTitle>
          {body.trim() && (
            <DialogDescription className="text-cat4-light/70">{body}</DialogDescription>
          )}
        </DialogHeader>

        {status === "success" ? (
          <p className="py-4 text-center text-lg font-medium text-cat4-light">
            Thanks for subscribing!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="links-first-name" className="text-cat4-light">
                First name (optional)
              </Label>
              <Input
                id="links-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 bg-white text-cat4-dark"
                placeholder="Your first name"
              />
            </div>
            <div>
              <Label htmlFor="links-email" className="text-cat4-light">
                Email
              </Label>
              <Input
                id="links-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-white text-cat4-dark"
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
              <span className="text-xs text-cat4-light/80">{brand.defaults.marketingConsent}</span>
            </label>
            {status === "error" && <p className="text-sm text-red-300">{errorMsg}</p>}
            <Button type="submit" disabled={status === "loading"} className="w-full">
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
