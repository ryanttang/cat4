"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { landingEntryAction } from "@/lib/actions/public";
import { SectionLabel } from "@/components/marketing/section-label";
import { PromotionPasswordGate } from "@/components/marketing/promotion-password-gate";
import { getPromotionSettings, PROMOTION_TYPE_LABELS } from "@/lib/promotion-utils";
import { PRODUCT_CATEGORIES } from "@/lib/utils";
import type { LandingPage, LandingPageBlock } from "@/lib/db/schema";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS",
  "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY",
  "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
  "WI", "WY",
];

const STEPS = ["Eligibility", "Your Info", "Preferences", "Review"];

type WizardData = {
  ageConfirmed: boolean;
  usResident: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
  favoriteCategory: string;
  referralSource: string;
  socialHandle: string;
  consent: boolean;
};

const initialData: WizardData = {
  ageConfirmed: false,
  usResident: false,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  state: "",
  favoriteCategory: "",
  referralSource: "",
  socialHandle: "",
  consent: false,
};

type PromotionEntryWizardProps = {
  page: LandingPage;
};

export function PromotionEntryWizard({ page }: PromotionEntryWizardProps) {
  const blocks = page.blocks as LandingPageBlock;
  const settings = getPromotionSettings(blocks);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(initialData);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  function update(field: keyof WizardData, value: string | boolean) {
    setData((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  function validateStep(): boolean {
    if (step === 0) {
      if (!data.ageConfirmed || !data.usResident) {
        setError("You must confirm eligibility to continue.");
        return false;
      }
    }
    if (step === 1) {
      if (!data.firstName.trim() || !data.lastName.trim() || !data.email.trim()) {
        setError("First name, last name, and email are required.");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        setError("Please enter a valid email address.");
        return false;
      }
      if (!data.state) {
        setError("Please select your state.");
        return false;
      }
    }
    if (step === 2) {
      if (!data.favoriteCategory || !data.referralSource) {
        setError("Please complete all preference fields.");
        return false;
      }
    }
    return true;
  }

  function nextStep() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prevStep() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submitEntry() {
    if (!data.consent) {
      setError("You must agree to the official rules to enter.");
      return;
    }

    setStatus("loading");
    setError("");

    const result = await landingEntryAction({
      landingPageId: page.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      consentMarketing: true,
      formData: {
        phone: data.phone,
        state: data.state,
        favoriteCategory: data.favoriteCategory,
        referralSource: data.referralSource,
        socialHandle: data.socialHandle,
        entryMethod: "wizard",
      },
    });

    if (result.success) {
      setStatus("success");
    } else {
      setStatus("idle");
      setError(result.error ?? "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <PromotionPasswordGate
        slug={page.slug}
        passwordProtected={settings.passwordProtected}
        accessPassword={settings.accessPassword}
      >
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-400" />
          <h1 className="mt-6 text-3xl font-bold text-cat4-light">You&apos;re in!</h1>
          <p className="mt-3 text-cat4-light/80">
            Your entry for <span className="font-semibold text-cat4-light">{page.title}</span> has been
            submitted. Good luck — we&apos;ll contact you if you win.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="outline" className="border-cat4-light/30 text-cat4-light">
              <Link href={`/l/${page.slug}`}>Back to promotion</Link>
            </Button>
            <Button asChild>
              <Link href="/">Explore CAT4</Link>
            </Button>
          </div>
        </div>
      </PromotionPasswordGate>
    );
  }

  return (
    <PromotionPasswordGate
      slug={page.slug}
      passwordProtected={settings.passwordProtected}
      accessPassword={settings.accessPassword}
    >
    <div className="mx-auto max-w-xl px-4 py-10 sm:py-16">
      <Button asChild variant="ghost" className="-ml-2 mb-6 text-cat4-light/80 hover:text-cat4-light">
        <Link href={`/l/${page.slug}`}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
      </Button>

      <div className="mb-8">
        <SectionLabel>{PROMOTION_TYPE_LABELS[page.type] ?? page.type} Entry</SectionLabel>
        <h1 className="mt-1 text-2xl font-bold text-cat4-light sm:text-3xl">{page.title}</h1>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  i < step
                    ? "bg-cat4-blue text-white"
                    : i === step
                      ? "bg-cat4-blue text-white ring-2 ring-cat4-blue/40 ring-offset-2 ring-offset-cat4-dark"
                      : "bg-white/10 text-cat4-light/50"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`hidden text-center text-xs sm:block ${i === step ? "font-medium text-cat4-light" : "text-cat4-light/50"}`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-cat4-blue transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/20 bg-cat4-surface p-6 shadow-xl sm:p-8">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-cat4-light">Confirm eligibility</h2>
              <p className="mt-1 text-sm text-cat4-light/60">
                Before entering, please confirm you meet the requirements.
              </p>
            </div>
            <label className="flex items-start gap-3 rounded-lg border border-border p-4">
              <input
                type="checkbox"
                checked={data.ageConfirmed}
                onChange={(e) => update("ageConfirmed", e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-cat4-light">
                I am <strong>21 years of age or older</strong>.
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-border p-4">
              <input
                type="checkbox"
                checked={data.usResident}
                onChange={(e) => update("usResident", e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-cat4-light">
                I am a legal <strong>U.S. resident</strong> and eligible to participate in this
                promotion.
              </span>
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-cat4-light">Your information</h2>
              <p className="mt-1 text-sm text-cat4-light/60">Tell us how to reach you if you win.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={data.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={data.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => update("email", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="(555) 555-5555"
                className="mt-1"
              />
            </div>
            <div>
              <Label>State *</Label>
              <Select value={data.state} onValueChange={(v) => update("state", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-cat4-light">Your preferences</h2>
              <p className="mt-1 text-sm text-cat4-light/60">Help us learn what CAT4 products you love.</p>
            </div>
            <div>
              <Label>Favorite product category *</Label>
              <Select value={data.favoriteCategory} onValueChange={(v) => update("favoriteCategory", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>How did you hear about this? *</Label>
              <Select value={data.referralSource} onValueChange={(v) => update("referralSource", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="friend">Friend or family</SelectItem>
                  <SelectItem value="dispensary">Dispensary</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="social">Social handle (optional)</Label>
              <Input
                id="social"
                value={data.socialHandle}
                onChange={(e) => update("socialHandle", e.target.value)}
                placeholder="@yourhandle"
                className="mt-1"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-cat4-light">Review & submit</h2>
              <p className="mt-1 text-sm text-cat4-light/60">Confirm your details before entering.</p>
            </div>
            <dl className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-cat4-light/60">Name</dt>
                <dd className="font-medium text-cat4-light">
                  {data.firstName} {data.lastName}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-cat4-light/60">Email</dt>
                <dd className="font-medium text-cat4-light">{data.email}</dd>
              </div>
              {data.phone && (
                <div className="flex justify-between gap-4">
                  <dt className="text-cat4-light/60">Phone</dt>
                  <dd className="font-medium text-cat4-light">{data.phone}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-cat4-light/60">State</dt>
                <dd className="font-medium text-cat4-light">{data.state}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-cat4-light/60">Favorite category</dt>
                <dd className="font-medium capitalize text-cat4-light">{data.favoriteCategory}</dd>
              </div>
            </dl>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={data.consent}
                onChange={(e) => update("consent", e.target.checked)}
                className="mt-1"
              />
              <span className="text-xs text-cat4-light/70">
                {blocks.form?.consentText ??
                  "I agree to the Official Rules and to receive marketing emails from CAT4."}
              </span>
            </label>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-8 flex justify-between gap-3">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={prevStep}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              Continue
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={submitEntry} disabled={status === "loading"}>
              {status === "loading" ? "Submitting..." : "Submit Entry"}
            </Button>
          )}
        </div>
      </div>
    </div>
    </PromotionPasswordGate>
  );
}
