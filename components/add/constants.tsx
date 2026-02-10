import {
  ShoppingCart,
  Utensils,
  Car,
  Clapperboard,
  Stethoscope,
  GraduationCap,
  Home,
  MoreHorizontal,
} from "lucide-react";
import type { Category, Verdict } from "@/lib/types";

export const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  식비: <Utensils className="w-4 h-4" />,
  교통: <Car className="w-4 h-4" />,
  쇼핑: <ShoppingCart className="w-4 h-4" />,
  "문화/여가": <Clapperboard className="w-4 h-4" />,
  의료: <Stethoscope className="w-4 h-4" />,
  교육: <GraduationCap className="w-4 h-4" />,
  주거: <Home className="w-4 h-4" />,
  기타: <MoreHorizontal className="w-4 h-4" />,
};

export const VERDICT_CONFIG: Record<
  Verdict,
  { label: string; color: string; bg: string }
> = {
  good: {
    label: "무죄",
    color: "text-[var(--pixel-lime)]",
    bg: "bg-[var(--pixel-lime)]",
  },
  bad: {
    label: "유죄",
    color: "text-[var(--pixel-red)]",
    bg: "bg-[var(--pixel-red)]",
  },
};

export const KEYPAD_BUTTONS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["000", "0", "delete"],
];

export function formatAmount(value: string) {
  if (!value) return "0";
  return parseInt(value, 10).toLocaleString("ko-KR");
}
