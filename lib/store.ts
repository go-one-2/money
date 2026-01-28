'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Expense } from './types';

interface ExpenseState {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpensesByMonth: (month: string) => Expense[];
  getExpensesByCategory: (category: string) => Expense[];
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],

      addExpense: (expense) =>
        set((state) => ({
          expenses: [expense, ...state.expenses],
        })),

      updateExpense: (id, updatedExpense) =>
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id ? { ...expense, ...updatedExpense } : expense
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        })),

      getExpensesByMonth: (month) => {
        return get().expenses.filter((expense) =>
          expense.date.startsWith(month)
        );
      },

      getExpensesByCategory: (category) => {
        return get().expenses.filter(
          (expense) => expense.category === category
        );
      },
    }),
    {
      name: 'expense-storage',
    }
  )
);
