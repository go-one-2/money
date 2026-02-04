"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type Category } from "@/lib/types";
import { CATEGORY_ICONS, formatAmount } from "./constants";

interface DetailFormProps {
  amount: string;
  category: Category;
  memo: string;
  onCategoryChange: (category: Category) => void;
  onMemoChange: (memo: string) => void;
  onBackToAmount: () => void;
  onSubmit: () => void;
  isTransitioning: boolean;
}

export function DetailForm({
  amount,
  category,
  memo,
  onCategoryChange,
  onMemoChange,
  onBackToAmount,
  onSubmit,
  isTransitioning,
}: DetailFormProps) {
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  return (
    <>
      {/* Amount Row - clickable to go back */}
      <div
        className={`
          px-4 transition-all duration-300 ease-out
          ${isTransitioning ? "opacity-50" : "opacity-100"}
        `}
      >
        <button
          onClick={onBackToAmount}
          className={`
            w-full flex items-center justify-between py-4 border-b border-foreground/10
            transition-all duration-300
            ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}
          `}
        >
          <span className="text-sm text-foreground">금액</span>
          <span className="text-xl pixel-number">{formatAmount(amount)}원</span>
        </button>
      </div>

      {/* Detail Form */}
      <div className="flex-1 px-4 py-2 overflow-auto">
        {/* Category Row */}
        <div
          className={`
            flex items-center justify-between py-4 border-b border-foreground/10
            transition-all duration-300 delay-75
            ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}
          `}
        >
          <span className="text-sm text-foreground">카테고리</span>
          <button
            onClick={() => setShowCategorySelect(!showCategorySelect)}
            className="flex items-center gap-2 text-foreground"
          >
            {CATEGORY_ICONS[category]}
            <span>{category}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showCategorySelect ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Category Select Dropdown */}
        {showCategorySelect && (
          <div className="py-2 border-b border-foreground/10">
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onCategoryChange(cat);
                    setShowCategorySelect(false);
                  }}
                  className={`flex flex-col items-center gap-1 p-3 rounded ${
                    category === cat
                      ? "bg-[var(--pixel-lime)] text-[var(--pixel-border)]"
                      : "text-foreground"
                  }`}
                >
                  {CATEGORY_ICONS[cat]}
                  <span className="text-xs">{cat}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Memo Row */}
        <div
          className={`
            py-4
            transition-all duration-300 delay-150
            ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}
          `}
        >
          <span className="text-sm text-foreground mb-2 block">메모</span>
          <textarea
            value={memo}
            onChange={(e) => onMemoChange(e.target.value)}
            placeholder="어떤 소비였나요? (선택)"
            className="w-full h-32 p-4 bg-card text-card-foreground border-2 border-foreground/20 resize-none text-sm"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div
        className={`
          px-4 pb-4
          transition-all duration-300 delay-200
          ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}
        `}
      >
        <Button variant="pixel-lime" className="w-full" onClick={onSubmit}>
          판단하기
        </Button>
      </div>
    </>
  );
}
