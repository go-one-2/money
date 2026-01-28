'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { ExpenseList } from '@/components/expense-list';
import { ExpenseForm } from '@/components/expense-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useExpenseStore } from '@/lib/store';
import { CATEGORIES, type Category, type Expense } from '@/lib/types';

export default function HistoryPage() {
  const { expenses, deleteExpense } = useExpenseStore();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    if (categoryFilter !== 'all') {
      result = result.filter((e) => e.category === categoryFilter);
    }

    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses, categoryFilter]);

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteExpense(id);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  return (
    <>
      <Header title="소비 내역" />
      <main className="container px-4 py-6 max-w-md mx-auto">
        <div className="mb-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="카테고리 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ExpenseList
          expenses={filteredExpenses}
          onDelete={handleDelete}
          onEdit={handleEdit}
          showActions
          emptyMessage="소비 내역이 없습니다."
        />
      </main>

      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>소비 수정</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <ExpenseForm
              expense={editingExpense}
              onSuccess={() => setEditingExpense(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
