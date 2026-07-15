import { cn } from "@/lib/utils";

type SectionLabelProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-cat4-blue/30 bg-cat4-blue/10 px-3 py-1 ps-[calc(0.75rem+0.05em)] text-center text-xs font-semibold uppercase tracking-wider text-cat4-blue",
        className
      )}
    >
      {children}
    </span>
  );
}
