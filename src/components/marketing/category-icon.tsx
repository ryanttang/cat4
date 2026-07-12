import {
  BatteryCharging,
  Cigarette,
  Droplets,
  Flower2,
  ShoppingBag,
} from "lucide-react";
import type { CategoryIconName } from "@/lib/product-education";

const ICONS = {
  flower: Flower2,
  cigarette: Cigarette,
  battery: BatteryCharging,
  droplets: Droplets,
  "shopping-bag": ShoppingBag,
} as const;

type CategoryIconProps = {
  name: CategoryIconName;
  className?: string;
};

export function CategoryIcon({ name, className }: CategoryIconProps) {
  const Icon = ICONS[name];
  return <Icon className={className} />;
}
