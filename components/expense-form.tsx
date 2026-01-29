'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
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

        // 세부 카테고리별 카운트 집계
        const subCategoryCounts: Record<SubCategory, number> = {
          '외식': getSubCategoryCountInMonth(currentMonth, '외식'),
          '커피': getSubCategoryCountInMonth(currentMonth, '커피'),
          '술': getSubCategoryCountInMonth(currentMonth, '술'),
          '배달음식': getSubCategoryCountInMonth(currentMonth, '배달음식'),
          '일반': getSubCategoryCountInMonth(currentMonth, '일반'),
        };

        // 카테고리별 총액 집계
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
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">날짜</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
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
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M3 10h18" />
                </svg>
                {date ? format(date, 'PPP', { locale: ko }) : '날짜를 선택하세요'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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
          <label className="text-sm font-medium">금액</label>
          <Input
            type="number"
            placeholder="금액을 입력하세요"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="numeric"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">카테고리</label>
          <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
            <SelectTrigger>
              <SelectValue placeholder="카테고리를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">메모</label>
          <Textarea
            placeholder="메모를 입력하세요 (선택)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleSubmit(false)}
          >
            {isEditing ? '수정' : '저장'}
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleSubmit(true)}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? '분석 중...' : 'AI 분석 후 저장'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
