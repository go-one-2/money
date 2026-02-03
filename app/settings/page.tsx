'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { useExpenseStore } from '@/lib/store';
import {
  CATEGORIES,
  PRIORITIES,
  PRIORITY_DESCRIPTIONS,
  type Category,
  type Priority,
} from '@/lib/types';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { userSettings, updateUserSettings } = useExpenseStore();

  const [monthlyIncome, setMonthlyIncome] = useState(
    userSettings.monthlyIncome.toString()
  );
  const [savingsGoal, setSavingsGoal] = useState(
    userSettings.savingsGoal.toString()
  );
  const [essentialCategories, setEssentialCategories] = useState<Category[]>(
    userSettings.essentialCategories
  );
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>(
    userSettings.priorities || []
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMonthlyIncome(userSettings.monthlyIncome.toString());
    setSavingsGoal(userSettings.savingsGoal.toString());
    setEssentialCategories(userSettings.essentialCategories);
    setSelectedPriorities(userSettings.priorities || []);
  }, [userSettings]);

  const toggleCategory = (category: Category) => {
    setEssentialCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const togglePriority = (priority: Priority) => {
    setSelectedPriorities((prev) => {
      if (prev.includes(priority)) {
        return prev.filter((p) => p !== priority);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, priority];
    });
  };

  const handleSave = () => {
    updateUserSettings({
      monthlyIncome: parseInt(monthlyIncome, 10) || 0,
      savingsGoal: parseInt(savingsGoal, 10) || 0,
      essentialCategories,
      priorities: selectedPriorities,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const availableBudget =
    (parseInt(monthlyIncome, 10) || 0) - (parseInt(savingsGoal, 10) || 0);

  return (
    <>
      <Header title="설정" />
      <main className="container px-4 py-6 max-w-md mx-auto space-y-4">
        <div className="pixel-card p-4">
          <div className="pb-3">
            <h3 className="text-base font-medium pixel-font">월 수입</h3>
          </div>
          <div>
            <div className="relative">
              <input
                type="number"
                placeholder="월 수입을 입력하세요"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                inputMode="numeric"
                className="pixel-input w-full pr-8"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                원
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              세후 실수령액을 입력해주세요
            </p>
          </div>
        </div>

        <div className="pixel-card p-4">
          <div className="pb-3">
            <h3 className="text-base font-medium pixel-font">월 저축 목표</h3>
          </div>
          <div>
            <div className="relative">
              <input
                type="number"
                placeholder="저축 목표를 입력하세요"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                inputMode="numeric"
                className="pixel-input w-full pr-8"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                원
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              한 달에 남기고 싶은 금액
            </p>
            {availableBudget > 0 && (
              <p className="text-xs text-primary mt-1">
                사용 가능 예산: {availableBudget.toLocaleString()}원/월
              </p>
            )}
          </div>
        </div>

        <div className="pixel-card p-4">
          <div className="pb-3">
            <h3 className="text-base font-medium pixel-font">소비 우선순위</h3>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-3">
              최대 3개까지 선택 가능 (선택한 우선순위에 해당하는 소비는 기준이
              완화됩니다)
            </p>
            <div className="space-y-2">
              {PRIORITIES.map((priority) => {
                const isSelected = selectedPriorities.includes(priority);
                const isDisabled = !isSelected && selectedPriorities.length >= 3;

                return (
                  <button
                    key={priority}
                    onClick={() => !isDisabled && togglePriority(priority)}
                    disabled={isDisabled}
                    className={cn(
                      'w-full p-3 text-left transition-all border-3',
                      isSelected
                        ? 'bg-primary border-border'
                        : 'bg-card border-border hover:bg-muted',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-5 h-5 border-2 flex items-center justify-center flex-shrink-0',
                          isSelected
                            ? 'border-border bg-border'
                            : 'border-muted-foreground'
                        )}
                      >
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="square"
                            strokeLinejoin="miter"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className={cn('font-medium text-sm', isSelected ? 'text-primary-foreground' : 'text-card-foreground')}>{priority}</p>
                        <p className={cn('text-xs', isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                          {PRIORITY_DESCRIPTIONS[priority]}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pixel-card p-4">
          <div className="pb-3">
            <h3 className="text-base font-medium pixel-font">필수 지출 카테고리</h3>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-3">
              선택한 카테고리는 항상 &quot;잘한 소비&quot;로 판정됩니다
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const isSelected = essentialCategories.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium transition-colors border-2',
                      isSelected
                        ? 'bg-primary text-primary-foreground border-border'
                        : 'bg-card text-card-foreground border-border hover:bg-muted'
                    )}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pixel-card p-4">
          <div className="pb-3">
            <h3 className="text-base font-medium pixel-font">유죄 판정 기준</h3>
          </div>
          <div className="space-y-3">
            <div className="text-sm space-y-2">
              <div className="flex justify-between py-2 border-b border-muted">
                <span className="text-muted-foreground">고액 지출</span>
                <span>월 수입의 5% 초과</span>
              </div>
              <div className="flex justify-between py-2 border-b border-muted">
                <span className="text-muted-foreground">외식 빈도</span>
                <span>월 8회 초과</span>
              </div>
              <div className="flex justify-between py-2 border-b border-muted">
                <span className="text-muted-foreground">커피 빈도</span>
                <span>월 15회 초과</span>
              </div>
              <div className="flex justify-between py-2 border-b border-muted">
                <span className="text-muted-foreground">술 빈도</span>
                <span>월 8회 초과</span>
              </div>
              <div className="flex justify-between py-2 border-b border-muted">
                <span className="text-muted-foreground">배달음식 빈도</span>
                <span>월 12회 초과</span>
              </div>
              <div className="flex justify-between py-2 border-b border-muted">
                <span className="text-muted-foreground">식비 예산</span>
                <span>월 수입의 15%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-muted">
                <span className="text-muted-foreground">쇼핑 예산</span>
                <span>월 수입의 10%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-muted">
                <span className="text-muted-foreground">문화/여가 예산</span>
                <span>월 수입의 10%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">목표 위험</span>
                <span>일일 예산의 3배 초과</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              * 우선순위에 해당하는 소비는 기준이 완화됩니다
            </p>
          </div>
        </div>

        <Button
          variant={saved ? 'pixel-lime' : 'pixel'}
          className="w-full"
          onClick={handleSave}
        >
          {saved ? '저장되었습니다!' : '저장하기'}
        </Button>
      </main>
    </>
  );
}
