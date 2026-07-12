"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductSearchBar } from "@/components/marketing/product-search-bar";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/education", label: "Education" },
  { href: "/find", label: "Find Us" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-cat4-primary/95 backdrop-blur supports-[backdrop-filter]:bg-cat4-primary/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-cat4-blue">CAT4</span>
        </Link>

        <Suspense fallback={<div className="hidden h-9 flex-1 md:block" />}>
          <ProductSearchBar className="mx-4 hidden max-w-sm flex-1 md:block lg:max-w-md" />
        </Suspense>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-cat4-light/80 transition-colors hover:text-cat4-blue"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild size="sm">
            <Link href="/subscribe">Subscribe</Link>
          </Button>
        </nav>

        <button
          className="text-cat4-light md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border/40 bg-cat4-primary px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Suspense fallback={null}>
              <ProductSearchBar onSearch={() => setOpen(false)} />
            </Suspense>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-cat4-light/80"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm" className="w-fit">
              <Link href="/subscribe">Subscribe</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
