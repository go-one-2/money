"use client";

import { useState } from "react";
import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ExpenseCardProps {
  expense: Expense;
  onDelete?: (id: string) => void;
  onEdit?: (expense: Expense) => void;
  showActions?: boolean;
}

const verdictConfig = {
  good: {
    label: "무죄",
    className: "text-black",
  },
  bad: {
    label: "유죄!",
    className: "text-destructive",
  },
  neutral: {
    label: "참작",
    className: "text-gray-500",
  },
};

export function ExpenseCard({
  expense,
  onDelete,
  onEdit,
  showActions = false,
}: ExpenseCardProps) {
  const [showReason, setShowReason] = useState(false);
  const verdict = expense.verdict ? verdictConfig[expense.verdict] : null;
  const hasReason = expense.reason;

  return (
    <div
      className={cn("bg-white mb-3 p-2", hasReason && "cursor-pointer")}
      onClick={() => hasReason && setShowReason(!showReason)}
    >
      <div className="flex justify-between items-center">
        {/* 왼쪽: 카테고리, 금액, 메모 */}
        <div className="flex-1">
          <span className="inline-block border-2 border-black px-2 py-0.5 text-xs font-bold mb-2">
            {expense.category}
          </span>
          <p className="text-2xl pixel-number text-black">
            {formatCurrency(expense.amount)}
          </p>
          {expense.memo && (
            <p className="text-sm text-gray-600 mt-1">{expense.memo}</p>
          )}
        </div>

        {/* 오른쪽: 판정, 날짜 */}
        <div className="text-right">
          {verdict && (
            <p
              className={cn("text-lg font-bold pixel-font", verdict.className)}
            >
              {verdict.label}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(expense.date)}
          </p>
        </div>
      </div>

      {/* 수정/삭제 버튼 */}
      {showActions && (
        <div
          className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit && (
            <Button
              variant="pixel-ghost"
              size="sm"
              onClick={() => onEdit(expense)}
            >
              수정
            </Button>
          )}
          {onDelete && (
            <Button
              variant="pixel-ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(expense.id)}
            >
              삭제
            </Button>
          )}
        </div>
      )}

      {/* 말풍선 - 카드 하단 */}
      {hasReason && showReason && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-700">
          {expense.reason}
        </div>
      )}
    </div>
  );
}
