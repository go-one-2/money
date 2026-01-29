'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Expense, UserSettings, SubCategory, Priority } from './types';
import { DEFAULT_USER_SETTINGS } from './types';

interface ExpenseState {
  expenses: Expense[];
  userSettings: UserSettings;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  getExpensesByMonth: (month: string) => Expense[];
  getExpensesByCategory: (category: string) => Expense[];
  getSubCategoryCountInMonth: (month: string, subCategory: SubCategory) => number;
  getCategoryTotalInMonth: (month: string, category: string) => number;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],
      userSettings: DEFAULT_USER_SETTINGS,

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

      updateUserSettings: (settings) =>
        set((state) => ({
          userSettings: { ...state.userSettings, ...settings },
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

      getSubCategoryCountInMonth: (month, subCategory) => {
        return get().expenses.filter(
          (expense) =>
            expense.date.startsWith(month) && expense.subCategory === subCategory
        ).length;
      },

      getCategoryTotalInMonth: (month, category) => {
        return get()
          .expenses.filter(
            (expense) =>
              expense.date.startsWith(month) && expense.category === category
          )
          .reduce((sum, e) => sum + e.amount, 0);
      },
    }),
    {
      name: 'expense-storage',
    }
  )
);
