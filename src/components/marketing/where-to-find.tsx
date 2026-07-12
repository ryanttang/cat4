import Image from "next/image";
import Link from "next/link";
import { Clock, ExternalLink, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Location } from "@/lib/db/schema";

type WhereToFindProps = {
  locations: Location[];
  compact?: boolean;
};

export function WhereToFind({ locations, compact = false }: WhereToFindProps) {
  const displayLocations = compact ? locations.slice(0, 3) : locations;

  return (
    <section className={compact ? "bg-muted/50 py-16" : "bg-cat4-primary py-20"}>
      <div
        className={`mx-auto px-4 sm:px-6 lg:px-8 ${compact ? "max-w-7xl" : "max-w-screen-2xl"}`}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-cat4-light sm:text-4xl">
            Where to Find CAT4
          </h2>
          <p className="mt-3 text-lg text-cat4-light/70">
            Available at Catalyst Cannabis dispensaries across California.
          </p>
        </div>

        <div
          className={`mt-10 grid grid-cols-2 gap-3 sm:gap-5 ${compact ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}
        >
          {displayLocations.map((loc) => (
            <article
              key={loc.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-cat4-surface shadow-sm transition-shadow hover:shadow-md"
            >
              {loc.imageUrl && (
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={loc.imageUrl}
                    alt={`${loc.name} storefront`}
                    fill
                    className="object-cover"
                    sizes={compact ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
                  />
                </div>
              )}
              <div className={`flex flex-1 flex-col ${compact ? "p-4 sm:p-6" : "p-3 sm:p-4"}`}>
                <h3 className={`font-semibold text-cat4-light ${compact ? "text-base sm:text-lg" : "text-sm sm:text-base"}`}>
                  {loc.name}
                </h3>
                <div className="mt-2.5 flex-1 space-y-1.5 text-xs text-cat4-light/70 sm:text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cat4-blue" />
                    <span>
                      {loc.address}, {loc.city}, {loc.state} {loc.zip}
                    </span>
                  </div>
                  {loc.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-cat4-blue" />
                      <a href={`tel:${loc.phone.replace(/[^\d+]/g, "")}`} className="hover:text-cat4-light">
                        {loc.phone}
                      </a>
                    </div>
                  )}
                  {loc.hours && (
                    <div className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-cat4-blue" />
                      <span>{loc.hours}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {loc.shopUrl && (
                    <Button asChild size="sm" className="w-full sm:flex-1">
                      <a href={loc.shopUrl} target="_blank" rel="noopener noreferrer">
                        Shop Now
                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                  {loc.directionsUrl && (
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                      <a href={loc.directionsUrl} target="_blank" rel="noopener noreferrer">
                        Directions
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {compact && locations.length > 3 && (
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/find">View All Locations</Link>
            </Button>
          </div>
        )}

        {displayLocations.length === 0 && (
          <p className="mt-8 text-center text-cat4-light/60">Locations coming soon.</p>
        )}
      </div>
    </section>
  );
}
