import { cn } from "@/lib/utils";

type SectionLabelProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-cat4-blue/30 bg-cat4-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cat4-blue",
        className
      )}
    >
      {children}
    </span>
  );
}
