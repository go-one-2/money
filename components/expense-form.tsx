'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useExpenseStore } from '@/lib/store';
import { CATEGORIES, type Category, type Expense, type SubCategory } from '@/lib/types';
import { generateId, cn, getCurrentMonth, getRemainingDaysInMonth } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ExpenseFormProps {
  expense?: Expense;
  onSuccess?: () => void;
}

export function ExpenseForm({ expense, onSuccess }: ExpenseFormProps) {
  const router = useRouter();
  const {
    addExpense,
    updateExpense,
    userSettings,
    getExpensesByMonth,
    getSubCategoryCountInMonth,
    getCategoryTotalInMonth,
  } = useExpenseStore();
  const isEditing = !!expense;

  const [date, setDate] = useState<Date>(
    expense ? new Date(expense.date) : new Date()
  );
  const [amount, setAmount] = useState(expense?.amount.toString() || '');
  const [category, setCategory] = useState<Category | ''>(
    expense?.category || ''
  );
  const [memo, setMemo] = useState(expense?.memo || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (analyze: boolean = false) => {
    if (!amount || !category) {
      alert('금액과 카테고리를 입력해주세요.');
      return;
    }

    const expenseData: Expense = {
      id: expense?.id || generateId(),
      date: format(date, 'yyyy-MM-dd'),
      amount: parseInt(amount, 10),
      category: category as Category,
      memo,
      verdict: expense?.verdict,
      reason: expense?.reason,
      subCategory: expense?.subCategory,
      createdAt: expense?.createdAt || new Date().toISOString(),
    };

    if (analyze) {
      setIsAnalyzing(true);
      try {
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
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }

    if (isEditing) {
      updateExpense(expense.id, expenseData);
    } else {
      addExpense(expenseData);
    }

    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/history');
    }
  };

  return (
    <div className="pixel-card p-4 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium pixel-font">날짜</label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'pixel-btn w-full justify-start text-left font-normal flex items-center',
                !date && 'text-muted-foreground'
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
                className="mr-2"
              >
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="0" />
                <path d="M3 10h18" />
              </svg>
              {date ? format(date, 'PPP', { locale: ko }) : '날짜를 선택하세요'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pixel-popover" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium pixel-font">금액</label>
        <input
          type="number"
          placeholder="금액을 입력하세요"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="numeric"
          className="pixel-input w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium pixel-font">카테고리</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="pixel-select w-full"
        >
          <option value="">카테고리를 선택하세요</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium pixel-font">메모</label>
        <textarea
          placeholder="메모를 입력하세요 (선택)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          className="pixel-textarea w-full"
        />
      </div>

      <div className="pt-2">
        <button
          className="w-full pixel-btn pixel-btn-lime"
          onClick={() => handleSubmit(true)}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? '판결 중...' : '판결하기'}
        </button>
      </div>
    </div>
  );
}
