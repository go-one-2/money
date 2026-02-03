'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Expense, UserSettings, SubCategory, Category } from './types';
import { DEFAULT_USER_SETTINGS } from './types';
import { getCurrentMonth, getRemainingDaysInMonth } from './utils';

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
  reanalyzeAllExpenses: () => Promise<void>;
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

      reanalyzeAllExpenses: async () => {
        const { expenses, userSettings, getSubCategoryCountInMonth, getCategoryTotalInMonth, getExpensesByMonth } = get();
        const currentMonth = getCurrentMonth();

        const updatedExpenses = await Promise.all(
          expenses.map(async (expense) => {
            const expenseMonth = expense.date.substring(0, 7);
            const monthlyExpenses = getExpensesByMonth(expenseMonth);
            const totalSpent = monthlyExpenses
              .filter(e => e.id !== expense.id)
              .reduce((sum, e) => sum + e.amount, 0);

            const subCategoryCounts: Record<SubCategory, number> = {
              '외식': getSubCategoryCountInMonth(expenseMonth, '외식'),
              '커피': getSubCategoryCountInMonth(expenseMonth, '커피'),
              '술': getSubCategoryCountInMonth(expenseMonth, '술'),
              '배달음식': getSubCategoryCountInMonth(expenseMonth, '배달음식'),
              '일반': getSubCategoryCountInMonth(expenseMonth, '일반'),
            };

            const categoryTotals: Record<Category, number> = {
              '식비': getCategoryTotalInMonth(expenseMonth, '식비'),
              '교통': getCategoryTotalInMonth(expenseMonth, '교통'),
              '쇼핑': getCategoryTotalInMonth(expenseMonth, '쇼핑'),
              '문화/여가': getCategoryTotalInMonth(expenseMonth, '문화/여가'),
              '의료': getCategoryTotalInMonth(expenseMonth, '의료'),
              '교육': getCategoryTotalInMonth(expenseMonth, '교육'),
              '주거': getCategoryTotalInMonth(expenseMonth, '주거'),
              '기타': getCategoryTotalInMonth(expenseMonth, '기타'),
            };

            // 해당 소비 제외하고 계산
            if (expense.category) {
              categoryTotals[expense.category] -= expense.amount;
            }

            try {
              const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  expense,
                  userSettings,
                  monthlyStats: {
                    subCategoryCounts,
                    categoryTotals,
                    totalSpent,
                    remainingDays: getRemainingDaysInMonth(),
                  },
                }),
              });
              const result = await response.json();
              return {
                ...expense,
                verdict: result.verdict,
                reason: result.reason,
                subCategory: result.subCategory,
              };
            } catch (error) {
              console.error('Reanalysis failed for expense:', expense.id, error);
              return expense;
            }
          })
        );

        set({ expenses: updatedExpenses });
      },
    }),
    {
      name: 'expense-storage',
    }
  )
);
