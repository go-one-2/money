'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  bad: {
    label: '못한 소비',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  neutral: {
    label: '보통',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
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
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">{expense.category}</Badge>
              {verdict && (
                <Badge className={verdict.className}>{verdict.label}</Badge>
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
              <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(expense)}
                >
                  수정
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
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
      </CardContent>
    </Card>
  );
}
