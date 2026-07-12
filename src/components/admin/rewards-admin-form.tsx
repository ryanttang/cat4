"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/admin/file-upload";
import { createQrCode, updateQrCode, deleteQrCode } from "@/lib/actions/admin";
import {
  QR_DESTINATION_TYPES,
  QR_DESTINATION_LABELS,
  QR_CLAIM_FIELD_TYPES,
  QR_CLAIM_OUTCOME_TYPES,
  defaultDestinationConfig,
  type QrDestinationType,
} from "@/lib/rewards/constants";
import { slugify } from "@/lib/utils";
import { brand } from "@/lib/brand";
import type { QrCode, QrDestinationConfig, LandingPage, Survey } from "@/lib/db/schema";
import type { AdminDialogFormProps } from "@/components/admin/admin-form-dialog";
import { Trash2, Plus } from "lucide-react";

type RewardsAdminFormProps = AdminDialogFormProps & {
  qrCode?: QrCode;
  promotions: LandingPage[];
  surveys: Survey[];
  polls: Survey[];
};

export function RewardsAdminForm({
  qrCode,
  promotions,
  surveys,
  polls,
  onSuccess,
}: RewardsAdminFormProps) {
  const config = (qrCode?.destinationConfig ?? {}) as QrDestinationConfig;

  const [title, setTitle] = useState(qrCode?.title ?? "");
  const [code, setCode] = useState(qrCode?.code ?? "");
  const [status, setStatus] = useState(qrCode?.status ?? "draft");
  const [destinationType, setDestinationType] = useState<QrDestinationType>(
    (qrCode?.destinationType as QrDestinationType) ?? "link_hub"
  );
  const [hubTitle, setHubTitle] = useState(config.hubTitle ?? "");
  const [hubBio, setHubBio] = useState(config.hubBio ?? "");
  const [hubImageUrl, setHubImageUrl] = useState(config.hubImageUrl ?? "");
  const [links, setLinks] = useState(
    config.links ?? [{ label: brand.defaults.hubLinkLabel, url: "/" }]
  );
  const [landingPageId, setLandingPageId] = useState(config.landingPageId ?? "");
  const [surveyId, setSurveyId] = useState(config.surveyId ?? "");
  const [externalUrl, setExternalUrl] = useState(config.externalUrl ?? "");
  const [claimFields, setClaimFields] = useState(
    config.claimForm?.fields ?? [
      { name: "email", label: "Email", type: "email", required: true },
      { name: "firstName", label: "First Name", type: "text", required: false },
    ]
  );
  const [consentText, setConsentText] = useState(
    config.claimForm?.consentText ?? brand.defaults.marketingConsent
  );
  const [claimOutcomeType, setClaimOutcomeType] = useState<
    "confirmation" | "code" | "redirect"
  >(config.claimOutcome?.type ?? "confirmation");
  const [claimMessage, setClaimMessage] = useState(
    config.claimOutcome?.message ?? "Thanks! Your reward claim has been submitted."
  );
  const [claimRedirectUrl, setClaimRedirectUrl] = useState(
    config.claimOutcome?.redirectUrl ?? ""
  );
  const [codePrefix, setCodePrefix] = useState(
    config.claimOutcome?.codePrefix ?? brand.defaults.rewardCodePrefix
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isProductQr = Boolean(qrCode?.productId);
  const availableDestinationTypes = isProductQr
    ? QR_DESTINATION_TYPES
    : QR_DESTINATION_TYPES.filter((t) => t !== "product_page");

  function handleDestinationTypeChange(value: QrDestinationType) {
    setDestinationType(value);
    const defaults = defaultDestinationConfig(value);
    if (value === "link_hub" && !qrCode) {
      setHubTitle(title);
      setLinks(defaults.links ?? links);
    }
    if (value === "claim_reward" && !config.claimForm) {
      setClaimFields(defaults.claimForm?.fields ?? claimFields);
      setConsentText(defaults.claimForm?.consentText ?? consentText);
      setClaimOutcomeType(defaults.claimOutcome?.type ?? "confirmation");
      setClaimMessage(defaults.claimOutcome?.message ?? claimMessage);
    }
    if (value === "external_url" && defaults.externalUrl) {
      setExternalUrl(defaults.externalUrl);
    }
  }

  function buildDestinationConfig(): QrDestinationConfig {
    switch (destinationType) {
      case "link_hub":
        return { hubTitle, hubBio, hubImageUrl: hubImageUrl || undefined, links };
      case "promotion":
        return { landingPageId: landingPageId || undefined };
      case "survey":
      case "poll":
        return { surveyId: surveyId || undefined };
      case "claim_reward":
        return {
          claimForm: { fields: claimFields, consentText },
          claimOutcome: {
            type: claimOutcomeType,
            message: claimMessage,
            redirectUrl: claimOutcomeType === "redirect" ? claimRedirectUrl : undefined,
            codePrefix: claimOutcomeType === "code" ? codePrefix : undefined,
          },
        };
      case "external_url":
        return { externalUrl };
      default:
        return {};
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      title,
      code: code || slugify(title).slice(0, 24),
      status,
      productId: qrCode?.productId ?? null,
      destinationType,
      destinationConfig: buildDestinationConfig(),
    };

    const result = qrCode
      ? await updateQrCode(qrCode.id, payload)
      : await createQrCode(payload);

    if (result.success) {
      onSuccess?.();
    } else {
      setError(result.error ?? "Failed to save");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!qrCode || !confirm("Delete this QR code?")) return;
    setLoading(true);
    const result = await deleteQrCode(qrCode.id);
    if (result.success) onSuccess?.();
    else {
      setError(result.error ?? "Failed to delete");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="code">Short Code</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder={slugify(title).slice(0, 24) || "auto-generated"}
            className="mt-1 font-mono"
          />
          <p className="mt-1 text-xs text-muted-foreground">URL: /r/{code || "..."}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as QrCode["status"])}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Destination</Label>
          <Select
            value={destinationType}
            onValueChange={(v) => handleDestinationTypeChange(v as QrDestinationType)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableDestinationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {QR_DESTINATION_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {destinationType === "link_hub" && (
        <div className="space-y-4 rounded-lg border border-border p-4">
          <div>
            <Label>Hub Title</Label>
            <Input value={hubTitle} onChange={(e) => setHubTitle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={hubBio} onChange={(e) => setHubBio(e.target.value)} className="mt-1" rows={2} />
          </div>
          <div>
            <FileUpload label="Profile Image" value={hubImageUrl} onChange={setHubImageUrl} />
          </div>
          <div className="space-y-2">
            <Label>Links</Label>
            {links.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => {
                    const next = [...links];
                    next[index] = { ...next[index], label: e.target.value };
                    setLinks(next);
                  }}
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => {
                    const next = [...links];
                    next[index] = { ...next[index], url: e.target.value };
                    setLinks(next);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setLinks(links.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLinks([...links, { label: "", url: "" }])}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Link
            </Button>
          </div>
        </div>
      )}

      {destinationType === "promotion" && (
        <div>
          <Label>Promotion</Label>
          <Select value={landingPageId} onValueChange={setLandingPageId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select promotion" />
            </SelectTrigger>
            <SelectContent>
              {promotions.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {destinationType === "survey" && (
        <div>
          <Label>Survey</Label>
          <Select value={surveyId} onValueChange={setSurveyId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select survey" />
            </SelectTrigger>
            <SelectContent>
              {surveys.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {destinationType === "poll" && (
        <div>
          <Label>Poll</Label>
          <Select value={surveyId} onValueChange={setSurveyId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select poll" />
            </SelectTrigger>
            <SelectContent>
              {polls.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {destinationType === "subscribe" && (
        <p className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Scanners will see the subscribe form inline on the rewards page.
        </p>
      )}

      {destinationType === "product_page" && (
        <p className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Scanners will be redirected to this product&apos;s page on the site.
        </p>
      )}

      {destinationType === "external_url" && (
        <div>
          <Label>External URL</Label>
          <Input
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1"
            required
          />
        </div>
      )}

      {destinationType === "claim_reward" && (
        <div className="space-y-4 rounded-lg border border-border p-4">
          <div className="space-y-2">
            <Label>Form Fields</Label>
            {claimFields.map((field, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-4">
                <Input
                  placeholder="name"
                  value={field.name}
                  onChange={(e) => {
                    const next = [...claimFields];
                    next[index] = { ...next[index], name: e.target.value };
                    setClaimFields(next);
                  }}
                />
                <Input
                  placeholder="Label"
                  value={field.label}
                  onChange={(e) => {
                    const next = [...claimFields];
                    next[index] = { ...next[index], label: e.target.value };
                    setClaimFields(next);
                  }}
                />
                <Select
                  value={field.type}
                  onValueChange={(v) => {
                    const next = [...claimFields];
                    next[index] = { ...next[index], type: v };
                    setClaimFields(next);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QR_CLAIM_FIELD_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => {
                        const next = [...claimFields];
                        next[index] = { ...next[index], required: e.target.checked };
                        setClaimFields(next);
                      }}
                    />
                    Required
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setClaimFields(claimFields.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setClaimFields([
                  ...claimFields,
                  { name: "", label: "", type: "text", required: false },
                ])
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Field
            </Button>
          </div>
          <div>
            <Label>Consent Text</Label>
            <Textarea value={consentText} onChange={(e) => setConsentText(e.target.value)} className="mt-1" rows={2} />
          </div>
          <div>
            <Label>After Submit</Label>
            <Select
              value={claimOutcomeType}
              onValueChange={(v) => setClaimOutcomeType(v as typeof claimOutcomeType)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QR_CLAIM_OUTCOME_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(claimOutcomeType === "confirmation" || claimOutcomeType === "code") && (
            <div>
              <Label>Success Message</Label>
              <Textarea value={claimMessage} onChange={(e) => setClaimMessage(e.target.value)} className="mt-1" rows={2} />
            </div>
          )}
          {claimOutcomeType === "code" && (
            <div>
              <Label>Code Prefix</Label>
              <Input value={codePrefix} onChange={(e) => setCodePrefix(e.target.value)} className="mt-1 font-mono" />
            </div>
          )}
          {claimOutcomeType === "redirect" && (
            <div>
              <Label>Redirect URL</Label>
              <Input value={claimRedirectUrl} onChange={(e) => setClaimRedirectUrl(e.target.value)} className="mt-1" />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : qrCode ? "Save Changes" : "Create QR Code"}
        </Button>
        {qrCode && !isProductQr && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
