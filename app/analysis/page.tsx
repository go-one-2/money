'use client';

import { useMemo } from 'react';
import { Header } from '@/components/header';
import { useExpenseStore } from '@/lib/store';
import { formatCurrency, getCurrentMonth, getLastMonth } from '@/lib/utils';
import { CATEGORIES } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const COLORS = [
  'var(--pixel-red)',
  '#ff6644',
  '#ff8844',
  'var(--pixel-lime)',
  '#88cc00',
  '#66aa00',
  '#449900',
  'var(--pixel-gray)',
];

export default function AnalysisPage() {
  const { expenses, getExpensesByMonth } = useExpenseStore();
  const currentMonth = getCurrentMonth();
  const lastMonth = getLastMonth();

  const categoryData = useMemo(() => {
    const currentMonthExpenses = getExpensesByMonth(currentMonth);
    const badExpenses = currentMonthExpenses.filter((e) => e.verdict === 'bad');

    const categoryTotals = CATEGORIES.map((cat) => {
      const categoryBadExpenses = badExpenses.filter((e) => e.category === cat);
      const total = categoryBadExpenses.reduce((sum, e) => sum + e.amount, 0);
      return {
        name: cat,
        value: total,
        count: categoryBadExpenses.length,
      };
    }).filter((item) => item.value > 0);

    return categoryTotals;
  }, [expenses, currentMonth, getExpensesByMonth]);

  const monthlyComparison = useMemo(() => {
    const currentMonthExpenses = getExpensesByMonth(currentMonth);
    const lastMonthExpenses = getExpensesByMonth(lastMonth);

    const currentGood = currentMonthExpenses
      .filter((e) => e.verdict === 'good')
      .reduce((sum, e) => sum + e.amount, 0);
    const currentBad = currentMonthExpenses
      .filter((e) => e.verdict === 'bad')
      .reduce((sum, e) => sum + e.amount, 0);

    const lastGood = lastMonthExpenses
      .filter((e) => e.verdict === 'good')
      .reduce((sum, e) => sum + e.amount, 0);
    const lastBad = lastMonthExpenses
      .filter((e) => e.verdict === 'bad')
      .reduce((sum, e) => sum + e.amount, 0);

    return [
      {
        name: '지난달',
        잘한소비: lastGood,
        못한소비: lastBad,
      },
      {
        name: '이번달',
        잘한소비: currentGood,
        못한소비: currentBad,
      },
    ];
  }, [expenses, currentMonth, lastMonth, getExpensesByMonth]);

  const weeklyTrend = useMemo(() => {
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    const weeks: { [key: string]: number } = {};
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(fourWeeksAgo.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const weekKey = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      weeks[weekKey] = 0;
    }

    expenses
      .filter((e) => e.verdict === 'bad')
      .forEach((expense) => {
        const expenseDate = new Date(expense.date);
        if (expenseDate >= fourWeeksAgo && expenseDate <= now) {
          const weekIndex = Math.floor(
            (expenseDate.getTime() - fourWeeksAgo.getTime()) /
              (7 * 24 * 60 * 60 * 1000)
          );
          const weekStart = new Date(
            fourWeeksAgo.getTime() + weekIndex * 7 * 24 * 60 * 60 * 1000
          );
          const weekKey = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
          if (weeks[weekKey] !== undefined) {
            weeks[weekKey] += expense.amount;
          }
        }
      });

    return Object.entries(weeks).map(([name, amount]) => ({
      name,
      금액: amount,
    }));
  }, [expenses]);

  const totalBadThisMonth = useMemo(() => {
    return getExpensesByMonth(currentMonth)
      .filter((e) => e.verdict === 'bad')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentMonth, getExpensesByMonth]);

  const totalBadLastMonth = useMemo(() => {
    return getExpensesByMonth(lastMonth)
      .filter((e) => e.verdict === 'bad')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, lastMonth, getExpensesByMonth]);

  const improvementRate =
    totalBadLastMonth > 0
      ? ((totalBadLastMonth - totalBadThisMonth) / totalBadLastMonth) * 100
      : 0;

  return (
    <>
      <Header title="소비 분석" />
      <main className="container px-4 py-6 max-w-md mx-auto">
        <div className="pixel-card p-4 mb-4">
          <div className="pb-2">
            <h3 className="text-sm font-medium">개선 목표 달성률</h3>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${improvementRate >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {improvementRate >= 0 ? '+' : ''}
                  {improvementRate.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  지난달 대비 못한 소비 {improvementRate >= 0 ? '감소' : '증가'}
                </p>
              </div>
              <div className="text-4xl">
                {improvementRate >= 0 ? '👍' : '👎'}
              </div>
            </div>
          </div>
        </div>

        <div className="pixel-card p-4 mb-4">
          <div className="pb-2">
            <h3 className="text-sm font-medium">
              주간 못한 소비 트렌드
            </h3>
          </div>
          <div>
            {weeklyTrend.some((w) => w.금액 > 0) ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrend}>
                    <XAxis dataKey="name" fontSize={12} stroke="var(--pixel-muted)" />
                    <YAxis fontSize={12} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} stroke="var(--pixel-muted)" />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                      labelFormatter={(label) => `${label} 주`}
                      contentStyle={{ background: 'var(--pixel-card)', border: '3px solid var(--pixel-border)', fontFamily: 'DungGeunMo' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="금액"
                      stroke="var(--pixel-red)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--pixel-red)', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                데이터가 없습니다
              </p>
            )}
          </div>
        </div>

        <div className="pixel-card p-4 mb-4">
          <div className="pb-2">
            <h3 className="text-sm font-medium">
              카테고리별 못한 소비 분포
            </h3>
          </div>
          <div>
            {categoryData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{ background: 'var(--pixel-card)', border: '3px solid var(--pixel-border)', fontFamily: 'DungGeunMo' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                데이터가 없습니다
              </p>
            )}
          </div>
        </div>

        <div className="pixel-card p-4 mb-4">
          <div className="pb-2">
            <h3 className="text-sm font-medium">월별 소비 비교</h3>
          </div>
          <div>
            {monthlyComparison.some((m) => m.잘한소비 > 0 || m.못한소비 > 0) ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyComparison}>
                    <XAxis dataKey="name" fontSize={12} stroke="var(--pixel-muted)" />
                    <YAxis fontSize={12} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} stroke="var(--pixel-muted)" />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{ background: 'var(--pixel-card)', border: '3px solid var(--pixel-border)', fontFamily: 'DungGeunMo' }}
                    />
                    <Legend />
                    <Bar dataKey="잘한소비" fill="var(--pixel-lime)" />
                    <Bar dataKey="못한소비" fill="var(--pixel-red)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                데이터가 없습니다
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
