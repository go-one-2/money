'use client';

import { ExpenseCard } from './expense-card';
import type { Expense } from '@/lib/types';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete?: (id: string) => void;
  onEdit?: (expense: Expense) => void;
  showActions?: boolean;
  emptyMessage?: string;
}

export function ExpenseList({
  expenses,
  onDelete,
  onEdit,
  showActions = false,
  emptyMessage = '소비 내역이 없습니다.',
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onDelete={onDelete}
          onEdit={onEdit}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
