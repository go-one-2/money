"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExpenseList } from "@/components/expense-list";
import { useExpenseStore } from "@/lib/store";
import { formatCurrency, getCurrentMonth, getLastMonth } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const { expenses, getExpensesByMonth, userSettings } = useExpenseStore();
  const currentMonth = getCurrentMonth();
  const lastMonth = getLastMonth();

  useEffect(() => {
    if (!userSettings.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [userSettings.onboardingCompleted, router]);

  const stats = useMemo(() => {
    const currentMonthExpenses = getExpensesByMonth(currentMonth);
    const lastMonthExpenses = getExpensesByMonth(lastMonth);

    const currentBadExpenses = currentMonthExpenses.filter(
      (e) => e.verdict === "bad",
    );
    const lastBadExpenses = lastMonthExpenses.filter(
      (e) => e.verdict === "bad",
    );

    const currentBadTotal = currentBadExpenses.reduce(
      (sum, e) => sum + e.amount,
      0,
    );
    const lastBadTotal = lastBadExpenses.reduce((sum, e) => sum + e.amount, 0);

    const currentTotal = currentMonthExpenses.reduce(
      (sum, e) => sum + e.amount,
      0,
    );
    const badPercentage =
      currentTotal > 0 ? (currentBadTotal / currentTotal) * 100 : 0;

    const improvement =
      lastBadTotal > 0
        ? ((lastBadTotal - currentBadTotal) / lastBadTotal) * 100
        : 0;

    const verdictCounts = {
      good: currentMonthExpenses.filter((e) => e.verdict === "good").length,
      bad: currentBadExpenses.length,
      neutral: currentMonthExpenses.filter(
        (e) => e.verdict === "neutral" || !e.verdict,
      ).length,
    };

    return {
      currentTotal,
      currentBadTotal,
      badPercentage,
      improvement,
      verdictCounts,
      totalExpenses: currentMonthExpenses.length,
    };
  }, [currentMonth, lastMonth, getExpensesByMonth]);

  const recentExpenses = useMemo(() => {
    return expenses.slice(0, 5);
  }, [expenses]);

  if (!userSettings.onboardingCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 상단 컬러 영역 */}
      <div className="bg-primary text-primary-foreground px-6 py-8">
        <p className=" font-bold mb-2">이번 달 전체 소비</p>

        {/* 금액 + 버튼 */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-4xl pixel-number">
            {formatCurrency(stats.currentTotal)}
          </p>
          <Link
            href="/add"
            className="text-4xl font-bold hover:scale-110 transition-transform"
          >
            +
          </Link>
        </div>

        {/* 유죄 소비 바 */}
        <div className="pt-6">
          <p className="text-sm mb-2 font-bold">
            유죄 소비 {formatCurrency(stats.currentBadTotal)} (
            {stats.badPercentage.toFixed(0)}%)
          </p>
          <div className="h-2 bg-white overflow-hidden">
            <div
              className="h-full bg-primary-foreground transition-all"
              style={{ width: `${Math.min(stats.badPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 하단 흰색 영역 */}
      <div className="flex-1 bg-white text-black pt-6 px-4 ">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="font-bold">최근 소비</span>
          <Link href="/history" className="text-sm text-gray-500">
            더보기
          </Link>
        </div>

        {recentExpenses.length > 0 ? (
          <ExpenseList expenses={recentExpenses} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">아직 소비 내역이 없습니다.</p>
            <Link
              href="/add"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground font-bold"
            >
              첫 소비 기록하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
