"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  Delete,
  ShoppingCart,
  Utensils,
  Car,
  Clapperboard,
  Stethoscope,
  GraduationCap,
  Home,
  MoreHorizontal,
  ChevronUp,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useExpenseStore } from "@/lib/store";
import {
  CATEGORIES,
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

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  식비: <Utensils className="w-4 h-4" />,
  교통: <Car className="w-4 h-4" />,
  쇼핑: <ShoppingCart className="w-4 h-4" />,
  "문화/여가": <Clapperboard className="w-4 h-4" />,
  의료: <Stethoscope className="w-4 h-4" />,
  교육: <GraduationCap className="w-4 h-4" />,
  주거: <Home className="w-4 h-4" />,
  기타: <MoreHorizontal className="w-4 h-4" />,
};

const VERDICT_CONFIG: Record<
  Verdict,
  { label: string; color: string; bg: string }
> = {
  good: {
    label: "무죄",
    color: "text-[var(--pixel-lime)]",
    bg: "bg-[var(--pixel-lime)]",
  },
  bad: {
    label: "유죄",
    color: "text-[var(--pixel-red)]",
    bg: "bg-[var(--pixel-red)]",
  },
  neutral: {
    label: "보류",
    color: "text-[var(--pixel-gray)]",
    bg: "bg-[var(--pixel-gray)]",
  },
};

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
    "amount",
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
  const [category, setCategory] = useState<Category>("쇼핑");
  const [memo, setMemo] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  // 판결 결과
  const [verdictResult, setVerdictResult] = useState<{
    verdict: Verdict;
    reason: string;
  } | null>(null);
  const [showVerdictContent, setShowVerdictContent] = useState(false);
  const [loadingDots, setLoadingDots] = useState("");

  // Drag handling
  const dragStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const formatAmount = (value: string) => {
    if (!value) return "0";
    return parseInt(value, 10).toLocaleString("ko-KR");
  };

  const handleKeyPress = (key: string) => {
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 150);

    if (key === "delete") {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === "000") {
      if (amount.length > 0 && amount.length <= 9) {
        setAmount((prev) => prev + "000");
      }
    } else {
      if (amount.length < 12) {
        setAmount((prev) => prev + key);
      }
    }
  };

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

  // 로딩 애니메이션
  useEffect(() => {
    if (step === "loading") {
      const interval = setInterval(() => {
        setLoadingDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 400);
      return () => clearInterval(interval);
    }
  }, [step]);

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

  const handleDateSelect = (d: Date | undefined) => {
    if (d) {
      setDate(d);
      setShowCalendar(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = dragStartY.current - currentY;
    if (diff > 0) {
      setDragOffset(-diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset < -100) {
      setShowCalendar(false);
    }
    setDragOffset(0);
    dragStartY.current = null;
  };

  const handleBack = () => {
    if (step === "detail") {
      handleBackToAmount();
    } else if (step === "result") {
      // 결과 화면에서는 뒤로가기 불가
      return;
    } else {
      setIsVisible(false);
      setTimeout(() => {
        router.back();
      }, 300);
    }
  };

  const keypadButtons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["000", "0", "delete"],
  ];

  // 로딩 화면
  if (step === "loading") {
    return (
      <div
        className={`fixed inset-0 flex flex-col bg-background overflow-hidden transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* 픽셀 저울 애니메이션 */}
          <div className="flex flex-col items-center">
            {/* 저울대 (흔들리는 부분) */}
            <div className="relative w-32 animate-scale-swing origin-top">
              {/* 가로 막대 */}
              <div className="h-2 bg-[var(--pixel-lime)] relative">
                <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-3 h-3 bg-[var(--pixel-lime)]" />
              </div>

              {/* 왼쪽 줄 + 접시 */}
              <div className="absolute left-1 top-2 flex flex-col items-center">
                <div className="w-0.5 h-12 bg-foreground/50" />
                <div className="w-5 h-1 bg-foreground/70 rounded-sm" />
                <div className="w-3 h-1 bg-foreground/70 rounded-sm" />
              </div>

              {/* 오른쪽 줄 + 접시 */}
              <div className="absolute right-1 top-2 flex flex-col items-center">
                <div className="w-0.5 h-12 bg-foreground/50" />
                <div className="w-5 h-1 bg-foreground/70 rounded-sm" />
                <div className="w-3 h-1 bg-foreground/70 rounded-sm" />
              </div>
            </div>

            {/* 기둥 - 저울대 바로 아래 붙임 */}
            <div className="w-2 h-20 bg-foreground/80" />
            {/* 받침대 */}
            <div className="w-10 h-2 bg-foreground/80 rounded-sm" />
            <div className="w-6 h-1 bg-foreground/60 rounded-sm" />
          </div>

          {/* 로딩 텍스트 */}
          <div className="mt-8 text-center">
            <p className="text-xl pixel-font text-foreground">
              판단 중{loadingDots}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              소비 내역을 분석하고 있어요
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 결과 화면
  if (step === "result" && verdictResult) {
    const config = VERDICT_CONFIG[verdictResult.verdict];

    return (
      <div
        className={`fixed inset-0 flex flex-col bg-background overflow-hidden transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* 결과 컨텐츠 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* 판결 라벨 */}
          <div
            className={`
              transition-all duration-500 ease-out
              ${showVerdictContent ? "opacity-100 scale-100" : "opacity-0 scale-75"}
            `}
          >
            <span className={`text-6xl pixel-font ${config.color}`}>
              {config.label}
            </span>
          </div>

          {/* 금액 */}
          <div
            className={`
              mt-8 transition-all duration-500 delay-200 ease-out
              ${showVerdictContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
          >
            <span className="text-2xl pixel-number text-foreground">
              {formatAmount(amount)}원
            </span>
          </div>

          {/* 카테고리 */}
          <div
            className={`
              mt-2 flex items-center gap-2 transition-all duration-500 delay-300 ease-out
              ${showVerdictContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
          >
            {CATEGORY_ICONS[category]}
            <span className="text-muted-foreground">{category}</span>
          </div>

          {/* 판결 이유 */}
          <div
            className={`
              mt-8 px-4 py-6 max-w-sm text-center
              transition-all duration-500 delay-500 ease-out
              ${showVerdictContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
          >
            <p className="text-foreground/80 text-sm leading-relaxed">
              {verdictResult.reason}
            </p>
          </div>
        </div>

        {/* 확인 버튼 */}
        <div
          className={`
            px-4 pb-4
            transition-all duration-500 delay-700 ease-out
            ${showVerdictContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          <Button
            variant="pixel-lime"
            className="w-full"
            onClick={handleConfirmResult}
          >
            확인
          </Button>
        </div>
      </div>
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
        {/* 금액 표시 - 항상 존재하며 위치만 변경 */}
        <div
          className={`
            transition-all duration-300 ease-out
            ${
              step === "amount"
                ? "flex-1 flex flex-col items-center justify-center px-4"
                : "px-4 py-0"
            }
            ${isTransitioning ? "opacity-50" : "opacity-100"}
          `}
        >
          {step === "amount" && (
            <p
              className={`text-muted-foreground mb-6 pixel-font transition-opacity duration-200 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            >
              얼마를 쓰셨어요?
            </p>
          )}

          {step === "detail" ? (
            <button
              onClick={handleBackToAmount}
              className={`
                w-full flex items-center justify-between py-4 border-b border-foreground/10
                transition-all duration-300
                ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}
              `}
            >
              <span className="text-sm text-foreground">금액</span>
              <span className="text-xl pixel-number">
                {formatAmount(amount)}원
              </span>
            </button>
          ) : (
            <div
              className={`text-4xl pixel-number tracking-tight transition-all duration-300 ${isTransitioning ? "opacity-0 -translate-y-8" : "opacity-100 translate-y-0"}`}
            >
              {formatAmount(amount)}원
            </div>
          )}
        </div>

        {step === "amount" ? (
          /* Keypad Section */
          <div
            className={`px-4 pb-4 transition-all duration-300 ${isTransitioning ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"}`}
          >
            <div className="grid grid-cols-3 gap-1 mb-4">
              {keypadButtons.flat().map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`
                    h-16 flex items-center justify-center text-xl
                    transition-colors
                    ${
                      activeKey === key
                        ? "bg-[var(--pixel-lime)] text-[var(--pixel-border)]"
                        : "bg-transparent text-foreground"
                    }
                    ${key === "delete" ? "" : "pixel-font"}
                  `}
                >
                  {key === "delete" ? <Delete className="w-6 h-6" /> : key}
                </button>
              ))}
            </div>

            <Button
              variant="pixel-lime"
              className="w-full"
              onClick={handleAmountComplete}
              disabled={!amount}
            >
              완료
            </Button>
          </div>
        ) : (
          <>
            {/* Detail Form */}
            <div className="flex-1 px-4 py-2 overflow-auto">
              {/* Category Row */}
              <div
                className={`
                  flex items-center justify-between py-4 border-b border-foreground/10
                  transition-all duration-300 delay-75
                  ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}
                `}
              >
                <span className="text-sm text-foreground">카테고리</span>
                <button
                  onClick={() => setShowCategorySelect(!showCategorySelect)}
                  className="flex items-center gap-2 text-foreground"
                >
                  {CATEGORY_ICONS[category]}
                  <span>{category}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showCategorySelect ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {/* Category Select Dropdown */}
              {showCategorySelect && (
                <div className="py-2 border-b border-foreground/10">
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategory(cat);
                          setShowCategorySelect(false);
                        }}
                        className={`flex flex-col items-center gap-1 p-3 rounded ${
                          category === cat
                            ? "bg-[var(--pixel-lime)] text-[var(--pixel-border)]"
                            : "text-foreground"
                        }`}
                      >
                        {CATEGORY_ICONS[cat]}
                        <span className="text-xs">{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Memo Row */}
              <div
                className={`
                  py-4
                  transition-all duration-300 delay-150
                  ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}
                `}
              >
                <span className="text-sm text-foreground mb-2 block">메모</span>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="어떤 소비였나요? (선택)"
                  className="w-full h-32 p-4 bg-card text-card-foreground border-2 border-foreground/20 resize-none text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div
              className={`
                px-4 pb-4
                transition-all duration-300 delay-200
                ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}
              `}
            >
              <Button
                variant="pixel-lime"
                className="w-full"
                onClick={handleSubmit}
              >
                판단하기
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Calendar Expand View - 날짜 섹션 아래에서 펼쳐짐 */}
      <div
        className={`
          absolute left-0 right-0 bg-background z-40 flex flex-col
          transition-all duration-300 ease-out overflow-hidden
          ${showCalendar ? "top-[88px] bottom-0 opacity-100" : "top-[88px] bottom-[100%] opacity-0"}
        `}
        style={{
          transform: showCalendar
            ? `translateY(${dragOffset}px)`
            : "translateY(0)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Calendar Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="w-full max-w-sm bg-transparent calendar-fullscreen"
          />
        </div>

        {/* Close Button */}
        <div className="pb-8 flex justify-center">
          <button
            onClick={() => setShowCalendar(false)}
            className="w-12 h-12 rounded-full border-2 border-foreground/30 flex items-center justify-center text-foreground/60"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
