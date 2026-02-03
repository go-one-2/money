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
    className: "pixel-badge-lime",
  },
  bad: {
    label: "유죄",
    className: "pixel-badge-red",
  },
  neutral: {
    label: "참작",
    className: "pixel-badge-gray",
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
      className={cn("pixel-card mb-3 p-4", hasReason && "cursor-pointer")}
      onClick={() => hasReason && setShowReason(!showReason)}
    >
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel-badge">{expense.category}</span>
            {verdict && (
              <span className={cn("pixel-badge", verdict.className)}>
                {verdict.label}
              </span>
            )}
          </div>
          <p className="text-2xl pixel-number">
            {formatCurrency(expense.amount)}
          </p>
          {expense.memo && <p className="text-base mt-1">{expense.memo}</p>}
          <p className="text-xs text-muted-foreground mt-2">
            {formatDate(expense.date)}
          </p>
        </div>

        {showActions && (
          <div
            className="absolute top-0 right-0 gap-1 ml-2"
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
      </div>

      {/* 말풍선 - 카드 하단 */}
      {hasReason && showReason && (
        <div className="mt-3 pixel-bubble-down text-sm text-black p-3">
          {expense.reason}
        </div>
      )}
    </div>
  );
}
