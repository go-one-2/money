'use client';

import { useMemo } from 'react';
import { useExpenseStore } from '@/lib/store';
import { getCurrentMonth, getLastMonth } from '@/lib/utils';
import type { Expense } from '@/lib/types';

export function useExpenses() {
  const store = useExpenseStore();
  const currentMonth = getCurrentMonth();
  const lastMonth = getLastMonth();

  const currentMonthExpenses = useMemo(
    () => store.getExpensesByMonth(currentMonth),
    [store.expenses, currentMonth]
  );

  const lastMonthExpenses = useMemo(
    () => store.getExpensesByMonth(lastMonth),
    [store.expenses, lastMonth]
  );

  const stats = useMemo(() => {
    const goodExpenses = currentMonthExpenses.filter((e) => e.verdict === 'good');
    const badExpenses = currentMonthExpenses.filter((e) => e.verdict === 'bad');
    const neutralExpenses = currentMonthExpenses.filter(
      (e) => e.verdict === 'neutral' || !e.verdict
    );

    const totalAmount = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const goodAmount = goodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const badAmount = badExpenses.reduce((sum, e) => sum + e.amount, 0);

    const lastMonthBadAmount = lastMonthExpenses
      .filter((e) => e.verdict === 'bad')
      .reduce((sum, e) => sum + e.amount, 0);

    const improvement =
      lastMonthBadAmount > 0
        ? ((lastMonthBadAmount - badAmount) / lastMonthBadAmount) * 100
        : 0;

    return {
      totalCount: currentMonthExpenses.length,
      goodCount: goodExpenses.length,
      badCount: badExpenses.length,
      neutralCount: neutralExpenses.length,
      totalAmount,
      goodAmount,
      badAmount,
      badPercentage: totalAmount > 0 ? (badAmount / totalAmount) * 100 : 0,
      improvement,
    };
  }, [currentMonthExpenses, lastMonthExpenses]);

  const recentExpenses = useMemo(
    () => store.expenses.slice(0, 10),
    [store.expenses]
  );

  return {
    ...store,
    currentMonthExpenses,
    lastMonthExpenses,
    stats,
    recentExpenses,
  };
}
