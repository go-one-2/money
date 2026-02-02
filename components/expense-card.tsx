'use client';

import type { Expense } from '@/lib/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

interface ExpenseCardProps {
  expense: Expense;
  onDelete?: (id: string) => void;
  onEdit?: (expense: Expense) => void;
  showActions?: boolean;
}

const verdictConfig = {
  good: {
    label: '잘한 소비',
    className: 'pixel-badge-lime',
  },
  bad: {
    label: '못한 소비',
    className: 'pixel-badge-red',
  },
  neutral: {
    label: '보통',
    className: 'pixel-badge-gray',
  },
};

export function ExpenseCard({
  expense,
  onDelete,
  onEdit,
  showActions = false,
}: ExpenseCardProps) {
  const verdict = expense.verdict ? verdictConfig[expense.verdict] : null;

  return (
    <div className="pixel-card mb-3 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel-badge">{expense.category}</span>
            {verdict && (
              <span className={cn('pixel-badge', verdict.className)}>{verdict.label}</span>
            )}
          </div>
          <p className="font-semibold text-lg">
            {formatCurrency(expense.amount)}
          </p>
          {expense.memo && (
            <p className="text-sm text-muted-foreground mt-1">
              {expense.memo}
            </p>
          )}
          {expense.reason && (
            <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted border-2 border-muted">
              {expense.reason}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {formatDate(expense.date)}
          </p>
        </div>
        {showActions && (
          <div className="flex gap-1 ml-2">
            {onEdit && (
              <button
                className="pixel-btn text-xs py-1 px-2"
                onClick={() => onEdit(expense)}
              >
                수정
              </button>
            )}
            {onDelete && (
              <button
                className="pixel-btn text-xs py-1 px-2 text-destructive"
                onClick={() => onDelete(expense.id)}
              >
                삭제
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
