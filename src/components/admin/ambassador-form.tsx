"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Download, ExternalLink, BarChart3 } from "lucide-react";
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
import { AdminPageHeader, adminSectionClass } from "@/components/admin/admin-ui";
import {
  createAmbassador,
  updateAmbassador,
  deleteAmbassador,
  enableAmbassadorPortal,
  disableAmbassadorPortal,
} from "@/lib/actions/ambassador-admin";
import { ambassadorDisplayName, ambassadorVanityPath } from "@/lib/ambassadors/constants";
import { slugify } from "@/lib/utils";
import type { BrandAmbassador, AmbassadorHubLink, QrCode } from "@/lib/db/schema";

type AmbassadorFormProps = {
  ambassador?: BrandAmbassador;
  qrCode?: QrCode | null;
};

export function AmbassadorForm({ ambassador, qrCode }: AmbassadorFormProps) {
  const router = useRouter();
  const isEdit = Boolean(ambassador);

  const [firstName, setFirstName] = useState(ambassador?.firstName ?? "");
  const [lastName, setLastName] = useState(ambassador?.lastName ?? "");
  const [email, setEmail] = useState(ambassador?.email ?? "");
  const [phone, setPhone] = useState(ambassador?.phone ?? "");
  const [photoUrl, setPhotoUrl] = useState(ambassador?.photoUrl ?? "");
  const [bio, setBio] = useState(ambassador?.bio ?? "");
  const [territory, setTerritory] = useState(ambassador?.territory ?? "");
  const [status, setStatus] = useState(ambassador?.status ?? "draft");
  const [slug, setSlug] = useState(ambassador?.slug ?? "");
  const [linkMode, setLinkMode] = useState<BrandAmbassador["linkMode"]>(
    ambassador?.linkMode ?? "global"
  );
  const [customLinks, setCustomLinks] = useState<AmbassadorHubLink[]>(
    ambassador?.customLinks ?? []
  );
  const [hubTitle, setHubTitle] = useState(ambassador?.hubOverrides?.hubTitle ?? "");
  const [hubBio, setHubBio] = useState(ambassador?.hubOverrides?.hubBio ?? "");
  const [hubImageUrl, setHubImageUrl] = useState(ambassador?.hubOverrides?.hubImageUrl ?? "");
  const [portalPassword, setPortalPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function buildPayload() {
    return {
      firstName,
      lastName,
      email,
      phone: phone || null,
      photoUrl: photoUrl || null,
      bio: bio || null,
      territory: territory || null,
      status,
      slug: slug || slugify(`${firstName}-${lastName}`),
      linkMode,
      customLinks,
      hubOverrides: {
        hubTitle: hubTitle || undefined,
        hubBio: hubBio || undefined,
        hubImageUrl: hubImageUrl || undefined,
      },
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = isEdit
      ? await updateAmbassador(ambassador!.id, buildPayload())
      : await createAmbassador(buildPayload());

    if (result.success) {
      router.push(isEdit ? `/admin/ambassadors/${ambassador!.id}` : `/admin/ambassadors/${result.id}`);
      router.refresh();
    } else {
      setError(result.error ?? "Something went wrong");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!ambassador || !confirm("Delete this ambassador? This cannot be undone.")) return;
    setLoading(true);
    const result = await deleteAmbassador(ambassador.id);
    if (result.success) {
      router.push("/admin/ambassadors");
      router.refresh();
    } else {
      setError(result.error ?? "Failed to delete");
      setLoading(false);
    }
  }

  async function handleEnablePortal() {
    if (!ambassador) return;
    setLoading(true);
    setError("");
    const result = await enableAmbassadorPortal(ambassador.id, { password: portalPassword });
    if (result.success) {
      setPortalPassword("");
      router.refresh();
    } else {
      setError(result.error ?? "Failed to enable portal");
    }
    setLoading(false);
  }

  async function handleDisablePortal() {
    if (!ambassador || !confirm("Disable portal access for this ambassador?")) return;
    setLoading(true);
    const result = await disableAmbassadorPortal(ambassador.id);
    if (result.success) router.refresh();
    else setError(result.error ?? "Failed to disable portal");
    setLoading(false);
  }

  const name = firstName && lastName ? ambassadorDisplayName(firstName, lastName) : "Ambassador";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <AdminPageHeader
        title={isEdit ? `Edit ${name}` : "Add Ambassador"}
        description="Manage ambassador profile, links, and portal access."
      >
        <div className="flex flex-wrap gap-2">
          {isEdit && (
            <>
              <Button type="button" variant="outline" asChild>
                <Link href={`/admin/ambassadors/${ambassador!.id}/analytics`}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </Button>
              {ambassador!.status === "published" && (
                <Button type="button" variant="outline" asChild>
                  <Link href={ambassadorVanityPath(ambassador!.slug)} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Hub
                  </Link>
                </Button>
              )}
            </>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Ambassador"}
          </Button>
        </div>
      </AdminPageHeader>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className={adminSectionClass}>
          <h2 className="text-lg font-semibold">Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="territory">Territory</Label>
            <Input id="territory" value={territory} onChange={(e) => setTerritory(e.target.value)} className="mt-1" placeholder="e.g. Los Angeles" />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1" rows={3} />
          </div>
          <div>
            <Label>Photo</Label>
            <div className="mt-1">
              <FileUpload label="Photo" value={photoUrl} onChange={setPhotoUrl} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1" placeholder="jane-doe" />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as BrandAmbassador["status"])}>
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
          </div>
        </div>

        <div className="space-y-8">
          <div className={adminSectionClass}>
            <h2 className="text-lg font-semibold">Link Configuration</h2>
            <div>
              <Label>Link Mode</Label>
              <Select value={linkMode} onValueChange={(v) => setLinkMode(v as BrandAmbassador["linkMode"])}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Use global template</SelectItem>
                  <SelectItem value="custom">Custom links only</SelectItem>
                  <SelectItem value="merge">Global + extra links</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {linkMode !== "global" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Custom Links</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomLinks([...customLinks, { label: "", url: "", enabled: true }])}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Link
                  </Button>
                </div>
                {customLinks.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Label"
                      value={link.label}
                      onChange={(e) => {
                        const next = [...customLinks];
                        next[index] = { ...link, label: e.target.value };
                        setCustomLinks(next);
                      }}
                    />
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => {
                        const next = [...customLinks];
                        next[index] = { ...link, url: e.target.value };
                        setCustomLinks(next);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setCustomLinks(customLinks.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">Hub overrides (optional)</p>
              <div>
                <Label htmlFor="hubTitle">Hub Title Override</Label>
                <Input id="hubTitle" value={hubTitle} onChange={(e) => setHubTitle(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="hubBio">Hub Bio Override</Label>
                <Textarea id="hubBio" value={hubBio} onChange={(e) => setHubBio(e.target.value)} className="mt-1" rows={2} />
              </div>
              <div>
                <Label>Hub Image Override</Label>
                <div className="mt-1">
                  <FileUpload label="Hub Image" value={hubImageUrl} onChange={setHubImageUrl} />
                </div>
              </div>
            </div>
          </div>

          {isEdit && qrCode && (
            <div className={adminSectionClass}>
              <h2 className="text-lg font-semibold">QR Code</h2>
              <p className="text-sm text-muted-foreground">
                Code: <code className="text-foreground">{qrCode.code}</code>
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={`/api/qr/${qrCode.code}/image`} download={`qr-${qrCode.code}.png`}>
                    <Download className="mr-2 h-4 w-4" />
                    Download QR
                  </a>
                </Button>
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={`/api/ambassadors/${ambassador!.id}/card`} download={`card-${ambassador!.slug}.png`}>
                    <Download className="mr-2 h-4 w-4" />
                    Phone Card
                  </a>
                </Button>
              </div>
            </div>
          )}

          {isEdit && (
            <div className={adminSectionClass}>
              <h2 className="text-lg font-semibold">Portal Access</h2>
              {ambassador!.userId ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Portal enabled. Ambassador can sign in at /ambassador/login
                  </p>
                  <Button type="button" variant="destructive" size="sm" onClick={handleDisablePortal} disabled={loading}>
                    Disable Portal
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Create login credentials so this ambassador can view their stats and download their QR card.
                  </p>
                  <div>
                    <Label htmlFor="portalPassword">Initial Password</Label>
                    <Input
                      id="portalPassword"
                      type="password"
                      minLength={8}
                      value={portalPassword}
                      onChange={(e) => setPortalPassword(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEnablePortal}
                    disabled={loading || portalPassword.length < 8}
                  >
                    Enable Portal Access
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isEdit && (
        <div className="border-t border-border pt-6">
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            Delete Ambassador
          </Button>
        </div>
      )}
    </form>
  );
}
