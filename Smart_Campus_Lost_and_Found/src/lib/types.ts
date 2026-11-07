import type { LucideIcon } from 'lucide-react';
import {
  Smartphone, Shirt, BookOpen, Key, Wallet, Briefcase, Dumbbell, Package,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Smartphone,
  Shirt,
  BookOpen,
  Key,
  Wallet,
  Briefcase,
  Dumbbell,
  Package,
};

export function getCategoryIcon(iconName: string): LucideIcon {
  return iconMap[iconName] ?? Package;
}
