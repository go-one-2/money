"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExpenseStore } from "@/lib/store";
import { CATEGORIES, type Category, type Expense } from "@/lib/types";
import { CATEGORY_ICONS } from "@/components/add/constants";
import { cn } from "@/lib/utils";

interface EditModalProps {
  expense: Expense;
  onClose: () => void;
}

export function EditModal({ expense, onClose }: EditModalProps) {
  const { updateExpense } = useExpenseStore();

  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState<Category>(expense.category);
  const [memo, setMemo] = useState(expense.memo ?? "");
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 마운트 후 슬라이드업
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = () => {
    if (!amount || amount === "0") return;
    updateExpense(expense.id, {
      ...expense,
      amount: parseInt(amount, 10),
      category,
      memo,
    });
    handleClose();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col bg-background transition-transform duration-300 ease-out",
        isVisible ? "translate-y-0" : "translate-y-full",
      )}
    >
      {/* 헤더 */}
      <header className="flex h-14 items-center px-4">
        <button onClick={handleClose} className="-ml-2 p-2 text-foreground">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="pixel-font text-lg text-foreground">소비 수정</h1>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto px-4 py-2">
          {/* 금액 */}
          <label className="flex cursor-text items-center justify-between border-b border-foreground/10 py-4">
            <span className="text-sm text-foreground">금액</span>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-40 bg-transparent text-right text-xl pixel-number text-foreground outline-none"
            />
          </label>

          {/* 카테고리 */}
          <div className="border-b border-foreground/10 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">카테고리</span>
              <button
                onClick={() => setShowCategorySelect((v) => !v)}
                className="flex items-center gap-2 text-foreground"
              >
                {CATEGORY_ICONS[category]}
                <span>{category}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    showCategorySelect && "rotate-180",
                  )}
                />
              </button>
            </div>

            {showCategorySelect && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setShowCategorySelect(false);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3",
                      category === cat
                        ? "bg-[var(--pixel-lime)] text-[var(--pixel-border)]"
                        : "text-foreground",
                    )}
                  >
                    {CATEGORY_ICONS[cat]}
                    <span className="text-xs">{cat}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 메모 */}
          <div className="py-4">
            <span className="mb-2 block text-sm text-foreground">메모</span>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="어떤 소비였나요? (선택)"
              className="h-32 w-full resize-none border-2 border-foreground/20 bg-card p-4 text-sm text-card-foreground"
            />
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="px-4 pb-6">
          <Button variant="pixel-lime" className="w-full" onClick={handleSubmit}>
            수정하기
          </Button>
        </div>
      </div>
    </div>
  );
}
