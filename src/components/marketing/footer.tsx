import Link from "next/link";
import { cn } from "@/lib/utils";
import type { FooterLink } from "@/lib/footer-links";

type FooterProps = {
  className?: string;
  productLinks: FooterLink[];
  companyLinks: FooterLink[];
};

export function Footer({ className, productLinks, companyLinks }: FooterProps) {
  const sections = {
    Products: productLinks,
    Company: companyLinks,
  };

  return (
    <footer className={cn("border-t border-border bg-cat4-dark text-cat4-light", className)}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-bold text-cat4-light">CAT4</span>
            <p className="mt-3 text-sm text-cat4-light/70">
              Premium cannabis products crafted with precision and passion.
            </p>
          </div>

          {Object.entries(sections).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-cat4-light/90">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-cat4-light/70 transition-colors hover:text-cat4-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-cat4-light/10 pt-6 text-center text-xs text-cat4-light/50">
          <p>&copy; {new Date().getFullYear()} CAT4. All rights reserved. Must be 21+ to purchase.</p>
        </div>
      </div>
    </footer>
  );
}
