'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">월 수입</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type="number"
                placeholder="월 수입을 입력하세요"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                inputMode="numeric"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                원
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              세후 실수령액을 입력해주세요
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">월 저축 목표</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type="number"
                placeholder="저축 목표를 입력하세요"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                inputMode="numeric"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">소비 우선순위</CardTitle>
          </CardHeader>
          <CardContent>
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
                      'w-full p-3 rounded-lg text-left transition-all border',
                      isSelected
                        ? 'bg-primary/10 border-primary'
                        : 'bg-background border-border hover:bg-muted',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                          isSelected
                            ? 'border-primary bg-primary'
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
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{priority}</p>
                        <p className="text-xs text-muted-foreground">
                          {PRIORITY_DESCRIPTIONS[priority]}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">필수 지출 카테고리</CardTitle>
          </CardHeader>
          <CardContent>
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
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:bg-muted'
                    )}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">유죄 판정 기준</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">고액 지출</span>
                <span>월 수입의 5% 초과</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">외식 빈도</span>
                <span>월 8회 초과</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">커피 빈도</span>
                <span>월 15회 초과</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">술 빈도</span>
                <span>월 8회 초과</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">배달음식 빈도</span>
                <span>월 12회 초과</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">식비 예산</span>
                <span>월 수입의 15%</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">쇼핑 예산</span>
                <span>월 수입의 10%</span>
              </div>
              <div className="flex justify-between py-2 border-b">
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
          </CardContent>
        </Card>

        <Button className="w-full" size="lg" onClick={handleSave}>
          {saved ? '저장되었습니다!' : '저장하기'}
        </Button>
      </main>
    </>
  );
}
