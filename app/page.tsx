'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  good: '#22c55e',
  bad: '#ef4444',
  neutral: '#9ca3af',
};

export default function HomePage() {
  const router = useRouter();
  const { expenses, getExpensesByMonth, userSettings } = useExpenseStore();
  const [isReady, setIsReady] = useState(false);
  const currentMonth = getCurrentMonth();
  const lastMonth = getLastMonth();

  useEffect(() => {
    // 온보딩 완료 여부 확인
    if (!userSettings.onboardingCompleted) {
      router.replace('/onboarding');
    } else {
      setIsReady(true);
    }
  }, [userSettings.onboardingCompleted, router]);

  // 모든 hooks는 조건부 리턴 전에 호출되어야 함
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

  // 온보딩 체크 중에는 로딩 표시
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <Header title="소비 판단" />
      <main className="container px-4 py-6 max-w-md mx-auto">
        <Card className="mb-4 bg-gradient-to-br from-red-50 to-orange-50 border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              이번 달 잘못한 소비
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(stats.currentBadTotal)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              전체 소비의 {stats.badPercentage.toFixed(1)}%
            </p>
            {stats.improvement !== 0 && (
              <p
                className={`text-sm mt-2 ${
                  stats.improvement > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stats.improvement > 0 ? '↓' : '↑'} 지난 달 대비{' '}
                {Math.abs(stats.improvement).toFixed(1)}%{' '}
                {stats.improvement > 0 ? '감소' : '증가'}
              </p>
            )}
          </CardContent>
        </Card>

        {chartData.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">소비 분포</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">최근 소비</h2>
          <Link href="/history">
            <Button variant="ghost" size="sm">
              더보기
            </Button>
          </Link>
        </div>

        {recentExpenses.length > 0 ? (
          <ExpenseList expenses={recentExpenses} />
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p className="mb-4">아직 소비 내역이 없습니다.</p>
              <Link href="/add">
                <Button>첫 소비 기록하기</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
