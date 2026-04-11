"use client";

import { Button } from "@/components/ui/button";
import type { Category, Verdict } from "@/lib/types";
import { CATEGORY_ICONS, VERDICT_CONFIG, formatAmount } from "./constants";

interface ResultScreenProps {
  isVisible: boolean;
  showContent: boolean;
  verdict: Verdict;
  reason: string;
  amount: string;
  category: Category;
  onConfirm: () => void;
}

export function ResultScreen({
  isVisible,
  showContent,
  verdict,
  reason,
  amount,
  category,
  onConfirm,
}: ResultScreenProps) {
  const config = VERDICT_CONFIG[verdict];

  return (
    <div
      className={`fixed inset-0 flex flex-col bg-background overflow-hidden transition-transform duration-300 ease-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* 결과 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* 판결 라벨 */}
        <div
          className={`
            transition-all duration-500 ease-out
            ${showContent ? "opacity-100 scale-100" : "opacity-0 scale-75"}
          `}
        >
          <span className={`text-6xl pixel-font ${config.color}`}>
            {config.label}
          </span>
        </div>

        {/* 금액 */}
        <div
          className={`
            mt-8 transition-all duration-500 delay-200 ease-out
            ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          <span className="text-2xl pixel-number text-foreground">
            {formatAmount(amount)}원
          </span>
        </div>

        {/* 카테고리 */}
        <div
          className={`
            mt-2 flex items-center gap-2 transition-all duration-500 delay-300 ease-out
            ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          {CATEGORY_ICONS[category]}
          <span className="text-muted-foreground">{category}</span>
        </div>

        {/* 판결 이유 */}
        <div
          className={`
            mt-8 px-4 py-6 max-w-sm text-center
            transition-all duration-500 delay-500 ease-out
            ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          <p className="text-foreground/80 text-sm leading-relaxed">{reason}</p>
        </div>
      </div>

      {/* 확인 버튼 */}
      <div
        className={`
          px-4 pb-4
          transition-all duration-500 delay-700 ease-out
          ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        <Button variant="pixel-lime" className="w-full" onClick={onConfirm}>
          확인
        </Button>
      </div>
    </div>
  );
}
