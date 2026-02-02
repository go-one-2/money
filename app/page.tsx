'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExpenseList } from '@/components/expense-list';
import { Header } from '@/components/header';
import { useExpenseStore } from '@/lib/store';
import { formatCurrency, getCurrentMonth, getLastMonth } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = {
  good: 'var(--pixel-lime)',
  bad: 'var(--pixel-red)',
  neutral: 'var(--pixel-gray)',
};

export default function HomePage() {
  const router = useRouter();
  const { expenses, getExpensesByMonth, userSettings } = useExpenseStore();
  const [isReady, setIsReady] = useState(false);
  const currentMonth = getCurrentMonth();
  const lastMonth = getLastMonth();

  useEffect(() => {
    if (!userSettings.onboardingCompleted) {
      router.replace('/onboarding');
    } else {
      setIsReady(true);
    }
  }, [userSettings.onboardingCompleted, router]);

  const stats = useMemo(() => {
    const currentMonthExpenses = getExpensesByMonth(currentMonth);
    const lastMonthExpenses = getExpensesByMonth(lastMonth);

    const currentBadExpenses = currentMonthExpenses.filter(
      (e) => e.verdict === 'bad'
    );
    const lastBadExpenses = lastMonthExpenses.filter((e) => e.verdict === 'bad');

    const currentBadTotal = currentBadExpenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );
    const lastBadTotal = lastBadExpenses.reduce((sum, e) => sum + e.amount, 0);

    const currentTotal = currentMonthExpenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );
    const badPercentage =
      currentTotal > 0 ? (currentBadTotal / currentTotal) * 100 : 0;

    const improvement =
      lastBadTotal > 0
        ? ((lastBadTotal - currentBadTotal) / lastBadTotal) * 100
        : 0;

    const verdictCounts = {
      good: currentMonthExpenses.filter((e) => e.verdict === 'good').length,
      bad: currentBadExpenses.length,
      neutral: currentMonthExpenses.filter(
        (e) => e.verdict === 'neutral' || !e.verdict
      ).length,
    };

    return {
      currentBadTotal,
      badPercentage,
      improvement,
      verdictCounts,
      totalExpenses: currentMonthExpenses.length,
    };
  }, [expenses, currentMonth, lastMonth, getExpensesByMonth]);

  const recentExpenses = useMemo(() => {
    return expenses.slice(0, 3);
  }, [expenses]);

  const chartData = useMemo(() => {
    const data = [];
    if (stats.verdictCounts.good > 0) {
      data.push({ name: '잘한 소비', value: stats.verdictCounts.good });
    }
    if (stats.verdictCounts.bad > 0) {
      data.push({ name: '못한 소비', value: stats.verdictCounts.bad });
    }
    if (stats.verdictCounts.neutral > 0) {
      data.push({ name: '미분류', value: stats.verdictCounts.neutral });
    }
    return data;
  }, [stats.verdictCounts]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <Header title="소비 판단" />
      <main className="container px-4 py-6 max-w-md mx-auto">
        <div className="pixel-card p-4 mb-4">
          <div className="pb-2">
            <h3 className="text-sm font-medium text-destructive pixel-font">
              이번 달 잘못한 소비
            </h3>
          </div>
          <div>
            <p className="text-3xl font-bold text-destructive pixel-font">
              {formatCurrency(stats.currentBadTotal)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              전체 소비의 {stats.badPercentage.toFixed(1)}%
            </p>
            {stats.improvement !== 0 && (
              <p
                className={`text-sm mt-2 ${
                  stats.improvement > 0 ? 'text-primary' : 'text-destructive'
                }`}
              >
                {stats.improvement > 0 ? '↓' : '↑'} 지난 달 대비{' '}
                {Math.abs(stats.improvement).toFixed(1)}%{' '}
                {stats.improvement > 0 ? '감소' : '증가'}
              </p>
            )}
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="pixel-card p-4 mb-4">
            <div className="pb-2">
              <h3 className="text-sm font-medium pixel-font">소비 분포</h3>
            </div>
            <div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name === '잘한 소비'
                              ? COLORS.good
                              : entry.name === '못한 소비'
                              ? COLORS.bad
                              : COLORS.neutral
                          }
                        />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground pixel-font">최근 소비</h2>
          <Link href="/history">
            <button className="pixel-btn text-sm py-2 px-4">
              더보기
            </button>
          </Link>
        </div>

        {recentExpenses.length > 0 ? (
          <ExpenseList expenses={recentExpenses} />
        ) : (
          <div className="pixel-card p-8 text-center">
            <p className="mb-4 text-muted-foreground">아직 소비 내역이 없습니다.</p>
            <Link href="/add">
              <button className="pixel-btn pixel-btn-lime">첫 소비 기록하기</button>
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
