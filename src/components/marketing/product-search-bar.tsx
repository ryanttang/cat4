"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ProductSearchBarProps = {
  className?: string;
  onSearch?: () => void;
};

export function ProductSearchBar({ className, onSearch }: ProductSearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = pathname.startsWith("/products") ? (searchParams.get("q") ?? "") : "";
  const [value, setValue] = useState(urlQuery);

  useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const q = value.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ""}`);
    onSearch?.();
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cat4-light/50" />
        <Input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search products..."
          className="h-9 border-cat4-light/20 bg-cat4-surface/50 pl-9 text-cat4-light placeholder:text-cat4-light/40 focus-visible:ring-cat4-blue"
          aria-label="Search products"
        />
      </div>
    </form>
  );
}
