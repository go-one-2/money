'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown, Delete, ShoppingCart, Utensils, Car, Clapperboard, Stethoscope, GraduationCap, Home, MoreHorizontal } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useExpenseStore } from '@/lib/store';
import { CATEGORIES, type Category, type Expense, type SubCategory } from '@/lib/types';
import { generateId, getCurrentMonth, getRemainingDaysInMonth } from '@/lib/utils';
import { format } from 'date-fns';

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  '식비': <Utensils className="w-4 h-4" />,
  '교통': <Car className="w-4 h-4" />,
  '쇼핑': <ShoppingCart className="w-4 h-4" />,
  '문화/여가': <Clapperboard className="w-4 h-4" />,
  '의료': <Stethoscope className="w-4 h-4" />,
  '교육': <GraduationCap className="w-4 h-4" />,
  '주거': <Home className="w-4 h-4" />,
  '기타': <MoreHorizontal className="w-4 h-4" />,
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

  const [step, setStep] = useState<'amount' | 'detail'>('amount');
  const [date, setDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDate(new Date());
    setMounted(true);
  }, []);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('쇼핑');
  const [memo, setMemo] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  // Drag handling
  const dragStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const formatAmount = (value: string) => {
    if (!value) return '0';
    return parseInt(value, 10).toLocaleString('ko-KR');
  };

  const handleKeyPress = (key: string) => {
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 150);

    if (key === 'delete') {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === '000') {
      if (amount.length > 0 && amount.length <= 9) {
        setAmount((prev) => prev + '000');
      }
    } else {
      if (amount.length < 12) {
        setAmount((prev) => prev + key);
      }
    }
  };

  const handleAmountComplete = () => {
    if (!amount || amount === '0') {
      return;
    }
    setStep('detail');
  };

  const handleSubmit = async () => {
    if (!amount || amount === '0' || !date) {
      return;
    }

    setIsAnalyzing(true);

    try {
      const expenseData: Expense = {
        id: generateId(),
        date: format(date!, 'yyyy-MM-dd'),
        amount: parseInt(amount, 10),
        category,
        memo,
        createdAt: new Date().toISOString(),
      };

      const currentMonth = getCurrentMonth();
      const monthlyExpenses = getExpensesByMonth(currentMonth);
      const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

      const subCategoryCounts: Record<SubCategory, number> = {
        '외식': getSubCategoryCountInMonth(currentMonth, '외식'),
        '커피': getSubCategoryCountInMonth(currentMonth, '커피'),
        '술': getSubCategoryCountInMonth(currentMonth, '술'),
        '배달음식': getSubCategoryCountInMonth(currentMonth, '배달음식'),
        '일반': getSubCategoryCountInMonth(currentMonth, '일반'),
      };

      const categoryTotals: Record<Category, number> = {
        '식비': getCategoryTotalInMonth(currentMonth, '식비'),
        '교통': getCategoryTotalInMonth(currentMonth, '교통'),
        '쇼핑': getCategoryTotalInMonth(currentMonth, '쇼핑'),
        '문화/여가': getCategoryTotalInMonth(currentMonth, '문화/여가'),
        '의료': getCategoryTotalInMonth(currentMonth, '의료'),
        '교육': getCategoryTotalInMonth(currentMonth, '교육'),
        '주거': getCategoryTotalInMonth(currentMonth, '주거'),
        '기타': getCategoryTotalInMonth(currentMonth, '기타'),
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      router.push('/history');
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
    }
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
    const diff = currentY - dragStartY.current;
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset > 100) {
      setShowCalendar(false);
    }
    setDragOffset(0);
    dragStartY.current = null;
  };

  const handleBack = () => {
    if (step === 'detail') {
      setStep('amount');
    } else {
      router.back();
    }
  };

  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['000', '0', 'delete'],
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center px-4 h-14">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 text-foreground"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg pixel-font">소비 입력</h1>
      </header>

      {/* Date Section */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm text-foreground">
          {date ? format(date, 'yyyy.MM.dd') : ''}
        </span>
        <button
          onClick={() => setShowCalendar(true)}
          className="text-sm text-muted-foreground"
        >
          날짜변경
        </button>
      </div>

      {step === 'amount' ? (
        <>
          {/* Amount Display Section */}
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <p className="text-muted-foreground mb-6 pixel-font">얼마를 쓰셨어요?</p>
            <div className="text-4xl pixel-number tracking-tight">
              {formatAmount(amount)}원
            </div>
          </div>

          {/* Keypad Section */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-3 gap-1 mb-4">
              {keypadButtons.flat().map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`
                    h-16 flex items-center justify-center text-xl
                    transition-colors
                    ${activeKey === key
                      ? 'bg-[var(--pixel-lime)] text-[var(--pixel-border)]'
                      : 'bg-transparent text-foreground'
                    }
                    ${key === 'delete' ? '' : 'pixel-font'}
                  `}
                >
                  {key === 'delete' ? (
                    <Delete className="w-6 h-6" />
                  ) : (
                    key
                  )}
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
        </>
      ) : (
        <>
          {/* Detail Form */}
          <div className="flex-1 px-4 py-2">
            {/* Amount Row */}
            <button
              onClick={() => setStep('amount')}
              className="w-full flex items-center justify-between py-4 border-b border-foreground/10"
            >
              <span className="text-sm text-foreground">금액</span>
              <span className="text-xl pixel-number">{formatAmount(amount)}원</span>
            </button>

            {/* Category Row */}
            <div className="flex items-center justify-between py-4 border-b border-foreground/10">
              <span className="text-sm text-foreground">카테고리</span>
              <button
                onClick={() => setShowCategorySelect(!showCategorySelect)}
                className="flex items-center gap-2 text-foreground"
              >
                {CATEGORY_ICONS[category]}
                <span>{category}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showCategorySelect ? 'rotate-180' : ''}`} />
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
                          ? 'bg-[var(--pixel-lime)] text-[var(--pixel-border)]'
                          : 'text-foreground'
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
            <div className="py-4">
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
          <div className="px-4 pb-4">
            <Button
              variant="pixel-lime"
              className="w-full"
              onClick={handleSubmit}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? '판단 중...' : '판단하기'}
            </Button>
          </div>
        </>
      )}

      {/* Calendar Slide-down View */}
      <div
        className={`
          fixed inset-0 bg-background z-50 flex flex-col
          transition-transform duration-300 ease-out
          ${showCalendar ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{
          transform: showCalendar
            ? `translateY(${dragOffset}px)`
            : 'translateY(100%)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Calendar Content - Full Screen */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <Calendar
            mode="single"
            selected={date ?? undefined}
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
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
