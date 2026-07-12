"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createLocation, updateLocation } from "@/lib/actions/admin";
import type { Location } from "@/lib/db/schema";
import { ChevronLeft } from "lucide-react";
import type { AdminDialogFormProps } from "@/components/admin/admin-form-dialog";

export function LocationForm({
  location,
  dialog,
  onSuccess,
}: AdminDialogFormProps & { location?: Location }) {
  const router = useRouter();
  const [name, setName] = useState(location?.name ?? "");
  const [address, setAddress] = useState(location?.address ?? "");
  const [city, setCity] = useState(location?.city ?? "");
  const [state, setState] = useState(location?.state ?? "");
  const [zip, setZip] = useState(location?.zip ?? "");
  const [phone, setPhone] = useState(location?.phone ?? "");
  const [hours, setHours] = useState(location?.hours ?? "");
  const [imageUrl, setImageUrl] = useState(location?.imageUrl ?? "");
  const [shopUrl, setShopUrl] = useState(location?.shopUrl ?? "");
  const [directionsUrl, setDirectionsUrl] = useState(location?.directionsUrl ?? "");
  const [published, setPublished] = useState(location?.published ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = { name, address, city, state, zip, phone, hours, imageUrl, shopUrl, directionsUrl, published };
    const result = location ? await updateLocation(location.id, data) : await createLocation(data);
    if (result.success) {
      if (onSuccess) onSuccess();
      else {
        router.push("/admin/locations");
        router.refresh();
      }
    } else {
      setError(result.error ?? "Failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={dialog ? "space-y-4" : "max-w-2xl space-y-4"}>
      {!dialog && (
        <Button asChild variant="ghost" className="-ml-2">
          <Link href="/admin/locations"><ChevronLeft className="mr-1 h-4 w-4" />Back</Link>
        </Button>
      )}
      {(["name", "address", "city", "state", "zip", "phone", "hours", "imageUrl", "shopUrl", "directionsUrl"] as const).map((field) => (
        <div key={field}>
          <Label htmlFor={field}>
            {field === "imageUrl"
              ? "Image URL"
              : field === "shopUrl"
                ? "Shop URL"
                : field === "directionsUrl"
                  ? "Directions URL"
                  : field.charAt(0).toUpperCase() + field.slice(1)}
          </Label>
          <Input
            id={field}
            required={field !== "phone" && field !== "hours" && field !== "imageUrl" && field !== "shopUrl" && field !== "directionsUrl"}
            value={{ name, address, city, state, zip, phone, hours, imageUrl, shopUrl, directionsUrl }[field]}
            onChange={(e) => {
              const setters = {
                name: setName,
                address: setAddress,
                city: setCity,
                state: setState,
                zip: setZip,
                phone: setPhone,
                hours: setHours,
                imageUrl: setImageUrl,
                shopUrl: setShopUrl,
                directionsUrl: setDirectionsUrl,
              };
              setters[field](e.target.value);
            }}
            className="mt-1"
          />
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Switch checked={published} onCheckedChange={setPublished} />
        <Label>Published</Label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : location ? "Update" : "Create"}</Button>
    </form>
  );
}
