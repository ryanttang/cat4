import { cn } from "@/lib/utils";

export const adminPanelClass = "rounded-lg border border-border bg-card";
export const adminTableWrapClass = "mt-8 overflow-x-auto rounded-lg border border-border bg-card";
export const adminSectionClass = "space-y-4 rounded-lg border border-border bg-card p-6";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

export function AdminPageHeader({ title, description, children, className }: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-4", className)}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

type AdminPanelProps = React.HTMLAttributes<HTMLDivElement> & {
  dashed?: boolean;
};

export function AdminPanel({ className, dashed, ...props }: AdminPanelProps) {
  return (
    <div
      className={cn(adminPanelClass, dashed && "border-dashed", className)}
      {...props}
    />
  );
}

type AdminTableThumbnailProps = {
  src?: string | null;
  alt: string;
};

export function AdminTableThumbnail({ src, alt }: AdminTableThumbnailProps) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </div>
  );
}
