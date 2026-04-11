'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { useExpenseStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { CATEGORIES, type Category, type Expense } from '@/lib/types';
import { CATEGORY_ICONS } from '@/components/add/constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// ── 타입 & 상수 ─────────────────────────────────────────────────
type Period = 'week' | 'month' | 'year';

const PERIOD_TABS: { label: string; value: Period }[] = [
  { label: '주', value: 'week' },
  { label: '달', value: 'month' },
  { label: '년', value: 'year' },
];

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function toMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function toDateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

// ── 기간별 데이터 계산 ──────────────────────────────────────────
function getDateRange(period: Period) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(now);
  rangeEnd.setDate(now.getDate() + 1);

  if (period === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    const prevEnd = new Date(start);
    const prevStart = new Date(start);
    prevStart.setDate(start.getDate() - 7);
    return { start, rangeEnd, prevStart, prevEnd };
  }
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(start);
    return { start, rangeEnd, prevStart, prevEnd };
  }
  const start = new Date(now.getFullYear(), 0, 1);
  const prevStart = new Date(now.getFullYear() - 1, 0, 1);
  const prevEnd = new Date(start);
  return { start, rangeEnd, prevStart, prevEnd };
}

function filterByRange(expenses: Expense[], from: Date, to: Date) {
  return expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= from && d < to;
  });
}

// ── 차트 데이터 생성 ────────────────────────────────────────────
function buildTrendData(
  period: Period,
  expenses: Expense[],
  getExpensesByMonth: (m: string) => Expense[],
) {
  const now = new Date();

  if (period === 'week') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - 6 + i);
      d.setHours(0, 0, 0, 0);
      const key = toDateStr(d);
      const dayExp = expenses.filter((e) => e.date === key);
      return {
        name: DAY_NAMES[d.getDay()],
        key,
        유죄: dayExp.filter((e) => e.verdict === 'bad').reduce((s, e) => s + e.amount, 0),
        무죄: dayExp.filter((e) => e.verdict === 'good').reduce((s, e) => s + e.amount, 0),
        isToday: i === 6,
      };
    });
  }

  if (period === 'month') {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = toMonthKey(d);
      const exp = getExpensesByMonth(key);
      return {
        name: `${d.getMonth() + 1}월`,
        key,
        유죄: exp.filter((e) => e.verdict === 'bad').reduce((s, e) => s + e.amount, 0),
        무죄: exp.filter((e) => e.verdict === 'good').reduce((s, e) => s + e.amount, 0),
        isToday: key === toMonthKey(now),
      };
    });
  }

  // year: 12개월
  const year = now.getFullYear();
  return Array.from({ length: 12 }, (_, i) => {
    const key = `${year}-${String(i + 1).padStart(2, '0')}`;
    const exp = getExpensesByMonth(key);
    return {
      name: `${i + 1}월`,
      key,
      유죄: exp.filter((e) => e.verdict === 'bad').reduce((s, e) => s + e.amount, 0),
      무죄: exp.filter((e) => e.verdict === 'good').reduce((s, e) => s + e.amount, 0),
      isToday: key === toMonthKey(now),
    };
  });
}

// ── 비교 레이블 ─────────────────────────────────────────────────
const COMPARE_LABEL: Record<Period, string> = {
  week: '지난주 대비',
  month: '지난달 대비',
  year: '전년 대비',
};

const TREND_LABEL: Record<Period, string> = {
  week: '최근 7일',
  month: '최근 6개월',
  year: `올해 ${new Date().getFullYear()}년`,
};

// ── SummaryCard ─────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: 'red' | 'lime' | 'neutral';
}) {
  return (
    <div className="border border-gray-200 bg-white p-4">
      <p className="mb-3 text-xs text-gray-400">{label}</p>
      <p
        className={cn('pixel-number mb-1.5 text-xl font-bold leading-none', {
          'text-destructive': accent === 'red',
          'text-[#84a900]': accent === 'lime',
          'text-black': accent === 'neutral',
        })}
      >
        {value}
      </p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-2.5 w-2.5" style={{ background: color }} />
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function AnalysisPage() {
  const [period, setPeriod] = useState<Period>('month');
  const { expenses, getExpensesByMonth } = useExpenseStore();

  const { start, rangeEnd, prevStart, prevEnd } = useMemo(() => getDateRange(period), [period]);

  const selectedExpenses = useMemo(
    () => filterByRange(expenses, start, rangeEnd),
    [expenses, start, rangeEnd],
  );

  const prevExpenses = useMemo(
    () => filterByRange(expenses, prevStart, prevEnd),
    [expenses, prevStart, prevEnd],
  );

  const stats = useMemo(() => {
    const bad = selectedExpenses.filter((e) => e.verdict === 'bad').reduce((s, e) => s + e.amount, 0);
    const good = selectedExpenses.filter((e) => e.verdict === 'good').reduce((s, e) => s + e.amount, 0);
    const total = bad + good;
    const badRatio = total > 0 ? (bad / total) * 100 : 0;
    const prevBad = prevExpenses.filter((e) => e.verdict === 'bad').reduce((s, e) => s + e.amount, 0);
    const improvement = prevBad > 0 ? ((prevBad - bad) / prevBad) * 100 : 0;
    return { bad, good, total, badRatio, improvement, count: selectedExpenses.length };
  }, [selectedExpenses, prevExpenses]);

  const trendData = useMemo(
    () => buildTrendData(period, expenses, getExpensesByMonth),
    [period, expenses, getExpensesByMonth],
  );

  const categoryBreakdown = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const items = selectedExpenses.filter((e) => e.category === cat && e.verdict === 'bad');
      return { cat, total: items.reduce((s, e) => s + e.amount, 0), count: items.length };
    })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [selectedExpenses]);

  const maxCatTotal = categoryBreakdown[0]?.total ?? 1;
  const isImproved = stats.improvement >= 0;

  return (
    <>
      <Header title="소비 분석" />

      {/* 기간 탭 */}
      <div className="sticky top-14 z-30 bg-black">
        <div className="flex">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setPeriod(tab.value)}
              className={cn(
                'flex-1 pt-4 pb-2 text-sm font-bold transition-colors',
                period === tab.value
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 히어로 */}
      <div className="bg-background px-5 pb-8 pt-6">
        <p className="mb-1 text-xs tracking-wide text-muted-foreground">유죄 소비</p>
        <p className="pixel-number mb-2 text-5xl leading-none text-destructive">
          {formatCurrency(stats.bad)}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>전체의 {stats.badRatio.toFixed(0)}%</span>
          <span>·</span>
          <span className={isImproved ? 'text-primary' : 'text-destructive'}>
            {isImproved ? '▼' : '▲'} {COMPARE_LABEL[period]}{' '}
            {Math.abs(stats.improvement).toFixed(0)}% {isImproved ? '감소' : '증가'}
          </span>
        </div>
      </div>

      {/* 화이트 컨텐츠 */}
      <div className="min-h-screen bg-white">
        {/* 차트 */}
        <div className="px-4 pb-4 pt-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            {TREND_LABEL[period]}
          </p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} barCategoryGap="28%" margin={{ left: -20, right: 4 }}>
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#aaa' }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  formatter={(v: number | undefined) => (v != null ? formatCurrency(v) : '')}
                  contentStyle={{
                    background: '#fff',
                    border: '2px solid #0a0a0a',
                    borderRadius: 0,
                    fontSize: 11,
                    fontFamily: 'DungGeunMo, monospace',
                  }}
                />
                <Bar dataKey="유죄" stackId="a" isAnimationActive={false}>
                  {trendData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={entry.isToday ? 'var(--pixel-red)' : 'rgba(255,68,68,0.3)'}
                    />
                  ))}
                </Bar>
                <Bar dataKey="무죄" stackId="a" isAnimationActive={false}>
                  {trendData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={entry.isToday ? 'var(--pixel-lime)' : 'rgba(200,230,0,0.25)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex justify-end gap-4">
            <LegendDot color="var(--pixel-red)" label="유죄" />
            <LegendDot color="var(--pixel-lime)" label="무죄" />
          </div>
        </div>

        <div className="mx-4 border-t border-gray-100" />

        {/* 요약 카드 */}
        <div className="px-4 pb-4 pt-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">요약</p>
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard
              label="유죄 소비"
              value={formatCurrency(stats.bad)}
              sub={`전체의 ${stats.badRatio.toFixed(0)}%`}
              accent="red"
            />
            <SummaryCard
              label="무죄 소비"
              value={formatCurrency(stats.good)}
              sub={`전체의 ${(100 - stats.badRatio).toFixed(0)}%`}
              accent="lime"
            />
            <SummaryCard
              label="총 소비"
              value={formatCurrency(stats.total)}
              sub={`${stats.count}건`}
              accent="neutral"
            />
            <SummaryCard
              label={COMPARE_LABEL[period]}
              value={`${isImproved ? '-' : '+'}${Math.abs(stats.improvement).toFixed(0)}%`}
              sub={isImproved ? '유죄 소비 감소 ↓' : '유죄 소비 증가 ↑'}
              accent={isImproved ? 'lime' : 'red'}
            />
          </div>
        </div>

        {/* 카테고리별 */}
        {categoryBreakdown.length > 0 && (
          <>
            <div className="mx-4 border-t border-gray-100" />
            <div className="px-4 pb-10 pt-5">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                카테고리별 유죄 소비
              </p>
              <div className="space-y-4">
                {categoryBreakdown.map(({ cat, total, count }) => (
                  <div key={cat} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center text-black">
                      {CATEGORY_ICONS[cat as Category]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-sm font-medium text-black">{cat}</span>
                        <span className="pixel-number text-sm text-black">
                          {formatCurrency(total)}
                        </span>
                      </div>
                      <div className="h-1 overflow-hidden bg-gray-100">
                        <div
                          className="h-full bg-[var(--pixel-red)] transition-all duration-500"
                          style={{ width: `${(total / maxCatTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-7 shrink-0 text-right text-xs text-gray-400">{count}건</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {stats.total === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">아직 소비 내역이 없습니다</p>
          </div>
        )}
      </div>
    </>
  );
}
