"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/admin/file-upload";
import { AdminPageHeader, adminSectionClass } from "@/components/admin/admin-ui";
import { updateAmbassadorSettings } from "@/lib/actions/ambassador-admin";
import type { AmbassadorHubDefaults, AmbassadorHubLink } from "@/lib/db/schema";

type AmbassadorGlobalSettingsFormProps = {
  defaults: AmbassadorHubDefaults;
};

export function AmbassadorGlobalSettingsForm({ defaults }: AmbassadorGlobalSettingsFormProps) {
  const router = useRouter();
  const [hubTitle, setHubTitle] = useState(defaults.hubTitle);
  const [hubBio, setHubBio] = useState(defaults.hubBio ?? "");
  const [hubImageUrl, setHubImageUrl] = useState(defaults.hubImageUrl ?? "");
  const [links, setLinks] = useState<AmbassadorHubLink[]>(defaults.links);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await updateAmbassadorSettings({
      hubTitle,
      hubBio: hubBio || undefined,
      hubImageUrl: hubImageUrl || undefined,
      links: links.filter((link) => link.label && link.url),
    });

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error ?? "Failed to save settings");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <AdminPageHeader
        title="Ambassador Global Settings"
        description="Default link hub template applied to all ambassadors using global or merge link modes."
      >
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </AdminPageHeader>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className={adminSectionClass}>
        <h2 className="text-lg font-semibold">Default Hub Branding</h2>
        <div>
          <Label htmlFor="hubTitle">Hub Title</Label>
          <Input id="hubTitle" required value={hubTitle} onChange={(e) => setHubTitle(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="hubBio">Hub Bio</Label>
          <Textarea id="hubBio" value={hubBio} onChange={(e) => setHubBio(e.target.value)} className="mt-1" rows={2} />
        </div>
        <div>
          <Label>Hub Image</Label>
          <div className="mt-1">
            <FileUpload label="Hub Image" value={hubImageUrl} onChange={setHubImageUrl} />
          </div>
        </div>
      </div>

      <div className={adminSectionClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Global Links</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLinks([...links, { label: "", url: "", enabled: true }])}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Link
          </Button>
        </div>
        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Label"
                value={link.label}
                onChange={(e) => {
                  const next = [...links];
                  next[index] = { ...link, label: e.target.value };
                  setLinks(next);
                }}
              />
              <Input
                placeholder="URL (e.g. /products or https://...)"
                value={link.url}
                onChange={(e) => {
                  const next = [...links];
                  next[index] = { ...link, url: e.target.value };
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
        </div>
      </div>
    </form>
  );
}
