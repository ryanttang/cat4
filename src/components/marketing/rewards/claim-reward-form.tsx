"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rewardClaimAction } from "@/lib/actions/public";
import type { QrCode, QrDestinationConfig } from "@/lib/db/schema";

type ClaimRewardFormProps = {
  qrCode: QrCode;
};

export function ClaimRewardForm({ qrCode }: ClaimRewardFormProps) {
  const router = useRouter();
  const config = (qrCode.destinationConfig ?? {}) as QrDestinationConfig;
  const fields = config.claimForm?.fields ?? [
    { name: "email", label: "Email", type: "email", required: true },
  ];
  const consentText =
    config.claimForm?.consentText ?? "I agree to receive marketing emails from CAT4.";

  const [values, setValues] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [rewardCode, setRewardCode] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "success") return;
    const outcome = config.claimOutcome;
    if (outcome?.type === "redirect" && outcome.redirectUrl) {
      const timer = setTimeout(() => router.push(outcome.redirectUrl!), 2000);
      return () => clearTimeout(timer);
    }
  }, [status, config.claimOutcome, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const email = values.email ?? values.Email ?? "";
    const firstName = values.firstName ?? values.first_name;
    const lastName = values.lastName ?? values.last_name;

    const result = await rewardClaimAction({
      qrCodeId: qrCode.id,
      email,
      firstName,
      lastName,
      consentMarketing: consent as true,
      formData: values,
    });

    if (!result.success) {
      setStatus("error");
      setErrorMsg(result.error ?? "Something went wrong");
      return;
    }

    setStatus("success");
    setSuccessMessage(result.message ?? "Thanks! Your reward claim has been submitted.");
    setRewardCode(result.rewardCode ?? null);

    if (result.outcomeType === "redirect" && result.redirectUrl) {
      router.push(result.redirectUrl);
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-cat4-dark px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-3xl font-bold text-cat4-light">Claim Submitted</h1>
          <p className="mt-4 text-lg text-cat4-light/80">{successMessage}</p>
          {rewardCode && (
            <p className="mt-6 rounded-xl border border-cat4-blue/40 bg-cat4-blue/10 px-6 py-4 font-mono text-2xl font-bold text-cat4-blue">
              {rewardCode}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cat4-dark px-4 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-3xl font-bold text-cat4-light">
          {qrCode.title}
        </h1>
        <p className="mt-3 text-center text-cat4-light/70">
          Complete the form below to claim your reward.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name} className="text-cat4-light">
                {field.label}
                {field.required && <span className="text-cat4-blue"> *</span>}
              </Label>
              <Input
                id={field.name}
                type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
                required={field.required}
                value={values[field.name] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                }
                className="mt-1 border-white/10 bg-white/5 text-cat4-light"
              />
            </div>
          ))}

          <label className="flex items-start gap-3 text-sm text-cat4-light/80">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
              required
            />
            <span>{consentText}</span>
          </label>

          {status === "error" && (
            <p className="text-sm text-red-400">{errorMsg}</p>
          )}

          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? "Submitting..." : "Claim Reward"}
          </Button>
        </form>
      </div>
    </div>
  );
}
