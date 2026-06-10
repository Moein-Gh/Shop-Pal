import {
  Apple,
  Beef,
  Beer,
  BookOpen,
  Coffee,
  Cookie,
  Egg,
  Fish,
  Flower2,
  GlassWater,
  Leaf,
  Milk,
  Package,
  Pill,
  ShoppingBasket,
  Snowflake,
  Sparkles,
  Wheat,
  type LucideIcon,
} from "lucide-react";

interface CategoryStyle {
  icon: LucideIcon;
  label: string;
  iconClass: string;
  badgeClass: string;
  borderClass: string;
}

const KNOWN: Record<string, CategoryStyle> = {
  dairy: {
    icon: Milk,
    label: "Dairy",
    iconClass: "text-sky-500",
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    borderClass: "border-l-sky-400",
  },
  milk: {
    icon: Milk,
    label: "Milk",
    iconClass: "text-sky-500",
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    borderClass: "border-l-sky-400",
  },
  produce: {
    icon: Apple,
    label: "Produce",
    iconClass: "text-green-500",
    badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    borderClass: "border-l-green-400",
  },
  fruits: {
    icon: Apple,
    label: "Fruits",
    iconClass: "text-green-500",
    badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    borderClass: "border-l-green-400",
  },
  vegetables: {
    icon: Leaf,
    label: "Vegetables",
    iconClass: "text-emerald-500",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    borderClass: "border-l-emerald-400",
  },
  meat: {
    icon: Beef,
    label: "Meat",
    iconClass: "text-red-500",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    borderClass: "border-l-red-400",
  },
  poultry: {
    icon: Beef,
    label: "Poultry",
    iconClass: "text-rose-500",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    borderClass: "border-l-rose-400",
  },
  seafood: {
    icon: Fish,
    label: "Seafood",
    iconClass: "text-cyan-500",
    badgeClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    borderClass: "border-l-cyan-400",
  },
  fish: {
    icon: Fish,
    label: "Fish",
    iconClass: "text-cyan-500",
    badgeClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    borderClass: "border-l-cyan-400",
  },
  bakery: {
    icon: Wheat,
    label: "Bakery",
    iconClass: "text-amber-500",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    borderClass: "border-l-amber-400",
  },
  bread: {
    icon: Wheat,
    label: "Bread",
    iconClass: "text-amber-500",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    borderClass: "border-l-amber-400",
  },
  frozen: {
    icon: Snowflake,
    label: "Frozen",
    iconClass: "text-blue-400",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    borderClass: "border-l-blue-400",
  },
  beverages: {
    icon: GlassWater,
    label: "Beverages",
    iconClass: "text-purple-500",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    borderClass: "border-l-purple-400",
  },
  drinks: {
    icon: GlassWater,
    label: "Drinks",
    iconClass: "text-purple-500",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    borderClass: "border-l-purple-400",
  },
  coffee: {
    icon: Coffee,
    label: "Coffee",
    iconClass: "text-yellow-700",
    badgeClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    borderClass: "border-l-yellow-600",
  },
  alcohol: {
    icon: Beer,
    label: "Alcohol",
    iconClass: "text-yellow-500",
    badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    borderClass: "border-l-yellow-400",
  },
  snacks: {
    icon: Cookie,
    label: "Snacks",
    iconClass: "text-orange-500",
    badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    borderClass: "border-l-orange-400",
  },
  eggs: {
    icon: Egg,
    label: "Eggs",
    iconClass: "text-yellow-500",
    badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    borderClass: "border-l-yellow-400",
  },
  "personal care": {
    icon: Sparkles,
    label: "Personal Care",
    iconClass: "text-pink-500",
    badgeClass: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    borderClass: "border-l-pink-400",
  },
  cleaning: {
    icon: Flower2,
    label: "Cleaning",
    iconClass: "text-teal-500",
    badgeClass: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    borderClass: "border-l-teal-400",
  },
  pharmacy: {
    icon: Pill,
    label: "Pharmacy",
    iconClass: "text-indigo-500",
    badgeClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    borderClass: "border-l-indigo-400",
  },
  school: {
    icon: BookOpen,
    label: "School",
    iconClass: "text-violet-500",
    badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    borderClass: "border-l-violet-400",
  },
  other: {
    icon: ShoppingBasket,
    label: "Other",
    iconClass: "text-slate-500",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    borderClass: "border-l-slate-400",
  },
};

// Ordered fallback palette for unknown categories
const FALLBACK_PALETTE: Omit<CategoryStyle, "icon" | "label">[] = [
  { iconClass: "text-violet-500", badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300", borderClass: "border-l-violet-400" },
  { iconClass: "text-fuchsia-500", badgeClass: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300", borderClass: "border-l-fuchsia-400" },
  { iconClass: "text-lime-600", badgeClass: "bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300", borderClass: "border-l-lime-500" },
  { iconClass: "text-rose-500", badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300", borderClass: "border-l-rose-400" },
  { iconClass: "text-sky-600", badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300", borderClass: "border-l-sky-500" },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getCategoryStyle(category: string): CategoryStyle {
  const key = category.toLowerCase().trim();
  if (KNOWN[key]) return KNOWN[key];

  const palette = FALLBACK_PALETTE[hashString(key) % FALLBACK_PALETTE.length];
  return {
    icon: Package,
    label: category,
    ...palette,
  };
}
