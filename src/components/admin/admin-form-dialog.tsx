"use client";

import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function useAdminFormDialog<T>() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEditing(item);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  return { open, editing, setOpen, openCreate, openEdit, close };
}

type AdminFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "default" | "wide" | "full";
};

export function AdminFormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "default",
}: AdminFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto",
          size === "wide" && "max-w-5xl",
          size === "full" && "max-h-[95vh] max-w-[min(1400px,96vw)] overflow-hidden p-0"
        )}
      >
        {size === "full" ? (
          <div className="flex max-h-[95vh] flex-col">
            <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            {children}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export type AdminDialogFormProps = {
  dialog?: boolean;
  onSuccess?: () => void;
};
