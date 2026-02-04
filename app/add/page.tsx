"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import {
  type Category,
  type Expense,
  type SubCategory,
  type Verdict,
} from "@/lib/types";
import {
  generateId,
  getCurrentMonth,
  getRemainingDaysInMonth,
} from "@/lib/utils";
import { format } from "date-fns";
import {
  AmountInput,
  DetailForm,
  LoadingScreen,
  ResultScreen,
  CalendarSheet,
} from "@/components/add";

export default function AddExpensePage() {
  const router = useRouter();
  const {
    addExpense,
    userSettings,
    getExpensesByMonth,
    getSubCategoryCountInMonth,
    getCategoryTotalInMonth,
  } = useExpenseStore();

  const [step, setStep] = useState<"amount" | "detail" | "loading" | "result">(
    "amount"
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [date, setDate] = useState<Date>(() => new Date());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("식비");
  const [memo, setMemo] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  // 판결 결과
  const [verdictResult, setVerdictResult] = useState<{
    verdict: Verdict;
    reason: string;
  } | null>(null);
  const [showVerdictContent, setShowVerdictContent] = useState(false);

  const handleAmountComplete = () => {
    if (!amount || amount === "0") {
      return;
    }
    setIsTransitioning(true);
    setTimeout(() => {
      setStep("detail");
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const handleBackToAmount = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep("amount");
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const handleSubmit = async () => {
    if (!amount || amount === "0") {
      return;
    }

    // 로딩 화면으로 전환
    setStep("loading");

    try {
      const expenseData: Expense = {
        id: generateId(),
        date: format(date, "yyyy-MM-dd"),
        amount: parseInt(amount, 10),
        category,
        memo,
        createdAt: new Date().toISOString(),
      };

      const currentMonth = getCurrentMonth();
      const monthlyExpenses = getExpensesByMonth(currentMonth);
      const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

      const subCategoryCounts: Record<SubCategory, number> = {
        외식: getSubCategoryCountInMonth(currentMonth, "외식"),
        커피: getSubCategoryCountInMonth(currentMonth, "커피"),
        술: getSubCategoryCountInMonth(currentMonth, "술"),
        배달음식: getSubCategoryCountInMonth(currentMonth, "배달음식"),
        일반: getSubCategoryCountInMonth(currentMonth, "일반"),
      };

      const categoryTotals: Record<Category, number> = {
        식비: getCategoryTotalInMonth(currentMonth, "식비"),
        교통: getCategoryTotalInMonth(currentMonth, "교통"),
        쇼핑: getCategoryTotalInMonth(currentMonth, "쇼핑"),
        "문화/여가": getCategoryTotalInMonth(currentMonth, "문화/여가"),
        의료: getCategoryTotalInMonth(currentMonth, "의료"),
        교육: getCategoryTotalInMonth(currentMonth, "교육"),
        주거: getCategoryTotalInMonth(currentMonth, "주거"),
        기타: getCategoryTotalInMonth(currentMonth, "기타"),
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expense: expenseData,
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
      expenseData.verdict = result.verdict;
      expenseData.reason = result.reason;
      expenseData.subCategory = result.subCategory;

      addExpense(expenseData);

      // 결과 저장
      setVerdictResult({
        verdict: result.verdict,
        reason: result.reason,
      });

      // 로딩 최소 시간 보장 후 결과 화면으로 전환
      setTimeout(() => {
        setStep("result");
        // 결과 컨텐츠 순차 표시
        setTimeout(() => {
          setShowVerdictContent(true);
        }, 100);
      }, 1500); // 최소 1.5초 로딩
    } catch (error) {
      console.error("Analysis failed:", error);
      setStep("detail"); // 에러 시 다시 상세 화면으로
    }
  };

  const handleConfirmResult = () => {
    setIsVisible(false);
    setTimeout(() => {
      router.push("/history");
    }, 300);
  };

  const handleBack = () => {
    if (step === "detail") {
      handleBackToAmount();
    } else if (step === "result") {
      return;
    } else {
      setIsVisible(false);
      setTimeout(() => {
        router.back();
      }, 300);
    }
  };

  // 로딩 화면
  if (step === "loading") {
    return <LoadingScreen isVisible={isVisible} />;
  }

  // 결과 화면
  if (step === "result" && verdictResult) {
    return (
      <ResultScreen
        isVisible={isVisible}
        showContent={showVerdictContent}
        verdict={verdictResult.verdict}
        reason={verdictResult.reason}
        amount={amount}
        category={category}
        onConfirm={handleConfirmResult}
      />
    );
  }

  return (
    <div
      className={`fixed inset-0 flex flex-col bg-background overflow-hidden transition-transform duration-300 ease-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Header - 캘린더 열리면 페이드아웃 */}
      <header
        className={`flex items-center px-4 h-14 transition-opacity duration-300 ${
          showCalendar ? "opacity-0" : "opacity-100"
        }`}
      >
        <button onClick={handleBack} className="p-2 -ml-2 text-foreground">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg pixel-font">소비 입력</h1>
      </header>

      {/* Date Section */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm text-foreground" suppressHydrationWarning>
          {format(date, "yyyy.MM.dd")}
        </span>
        <button
          onClick={() => setShowCalendar(true)}
          className="text-sm text-muted-foreground"
        >
          날짜변경
        </button>
      </div>

      {/* 메인 컨텐츠 - 캘린더 열리면 페이드아웃 */}
      <div
        className={`flex-1 flex flex-col transition-opacity duration-300 overflow-hidden ${
          showCalendar ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {step === "amount" ? (
          <AmountInput
            amount={amount}
            onAmountChange={setAmount}
            onComplete={handleAmountComplete}
            isTransitioning={isTransitioning}
          />
        ) : (
          <DetailForm
            amount={amount}
            category={category}
            memo={memo}
            onCategoryChange={setCategory}
            onMemoChange={setMemo}
            onBackToAmount={handleBackToAmount}
            onSubmit={handleSubmit}
            isTransitioning={isTransitioning}
          />
        )}
      </div>

      {/* Calendar Sheet */}
      <CalendarSheet
        isOpen={showCalendar}
        selectedDate={date}
        onDateSelect={(d) => d && setDate(d)}
        onClose={() => setShowCalendar(false)}
      />
    </div>
  );
}
