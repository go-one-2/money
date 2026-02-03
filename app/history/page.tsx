'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { ExpenseList } from '@/components/expense-list';
import { ExpenseForm } from '@/components/expense-form';
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
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pixel-select w-full"
          >
            <option value="all">전체</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <ExpenseList
          expenses={filteredExpenses}
          onDelete={handleDelete}
          onEdit={handleEdit}
          showActions
          emptyMessage="소비 내역이 없습니다."
        />
      </main>

      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pixel-dialog-overlay">
          <div className="pixel-dialog max-w-md w-full mx-4 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold pixel-font">소비 수정</h2>
              <button
                onClick={() => setEditingExpense(null)}
                className="text-muted-foreground hover:text-card-foreground text-xl"
              >
                ✕
              </button>
            </div>
            <ExpenseForm
              expense={editingExpense}
              onSuccess={() => setEditingExpense(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
