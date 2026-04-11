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
import { CATEGORY_ICONS } from '@/components/add/constants';
import { cn } from '@/lib/utils';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
      {children}
    </p>
  );
}

function Row({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-4',
        !last && 'border-b border-gray-100',
      )}
    >
      <span className="text-sm text-gray-500">{label}</span>
      {children}
    </div>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-3',
        !last && 'border-b border-gray-100',
      )}
    >
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-black">{value}</span>
    </div>
  );
}

export default function SettingsPage() {
  const { userSettings, updateUserSettings, reanalyzeAllExpenses } = useExpenseStore();

  const [monthlyIncome, setMonthlyIncome] = useState(userSettings.monthlyIncome.toString());
  const [savingsGoal, setSavingsGoal] = useState(userSettings.savingsGoal.toString());
  const [essentialCategories, setEssentialCategories] = useState<Category[]>(
    userSettings.essentialCategories,
  );
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>(
    userSettings.priorities || [],
  );
  const [saved, setSaved] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  useEffect(() => {
    setMonthlyIncome(userSettings.monthlyIncome.toString());
    setSavingsGoal(userSettings.savingsGoal.toString());
    setEssentialCategories(userSettings.essentialCategories);
    setSelectedPriorities(userSettings.priorities || []);
  }, [userSettings]);

  const toggleCategory = (category: Category) => {
    setEssentialCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const togglePriority = (priority: Priority) => {
    setSelectedPriorities((prev) => {
      if (prev.includes(priority)) return prev.filter((p) => p !== priority);
      if (prev.length >= 3) return prev;
      return [...prev, priority];
    });
  };

  const handleSave = async () => {
    updateUserSettings({
      monthlyIncome: parseInt(monthlyIncome, 10) || 0,
      savingsGoal: parseInt(savingsGoal, 10) || 0,
      essentialCategories,
      priorities: selectedPriorities,
    });
    setIsReanalyzing(true);
    try {
      await reanalyzeAllExpenses();
    } catch (error) {
      console.error('Reanalysis failed:', error);
    } finally {
      setIsReanalyzing(false);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const income = parseInt(monthlyIncome, 10) || 0;
  const savings = parseInt(savingsGoal, 10) || 0;
  const availableBudget = income - savings;

  return (
    <>
      <Header title="설정" />

      {/* 히어로 — 다크 배경 */}
      <div className="bg-background px-5 pb-8 pt-6">
        <p className="mb-1 text-xs tracking-wide text-muted-foreground">사용 가능 예산</p>
        <p className="pixel-number mb-2 text-5xl leading-none text-primary">
          {availableBudget > 0 ? `${availableBudget.toLocaleString()}원` : '—'}
        </p>
        <p className="text-xs text-muted-foreground">
          월 수입 {income > 0 ? `${income.toLocaleString()}원` : '미설정'} -{' '}
          저축 {savings > 0 ? `${savings.toLocaleString()}원` : '미설정'}
        </p>
      </div>

      {/* 화이트 컨텐츠 */}
      <div className="min-h-screen bg-white pb-10">

        {/* 재정 정보 */}
        <div className="px-4 pt-5 pb-4">
          <SectionLabel>재정 정보</SectionLabel>
          <label className="flex cursor-text items-center justify-between border-b border-gray-100 py-4">
            <span className="text-sm text-gray-500">월 수입</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-36 bg-transparent text-right text-lg pixel-number text-black outline-none"
              />
              <span className="text-sm text-gray-400">원</span>
            </div>
          </label>
          <label className="flex cursor-text items-center justify-between py-4">
            <span className="text-sm text-gray-500">월 저축 목표</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                className="w-36 bg-transparent text-right text-lg pixel-number text-black outline-none"
              />
              <span className="text-sm text-gray-400">원</span>
            </div>
          </label>
        </div>

        <div className="mx-4 border-t border-gray-100" />

        {/* 소비 우선순위 */}
        <div className="px-4 pt-5 pb-4">
          <SectionLabel>소비 우선순위</SectionLabel>
          <p className="mb-3 text-xs text-gray-400">
            최대 3개 선택 · 해당 소비는 판정 기준이 완화됩니다
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
                    'w-full border p-3 text-left transition-colors',
                    isSelected
                      ? 'border-[var(--pixel-lime)] bg-[var(--pixel-lime)]'
                      : 'border-gray-200 bg-white',
                    isDisabled && 'cursor-not-allowed opacity-40',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center border-2',
                        isSelected ? 'border-black bg-black' : 'border-gray-300',
                      )}
                    >
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={cn('text-sm font-medium', isSelected ? 'text-black' : 'text-black')}>
                        {priority}
                      </p>
                      <p className={cn('text-xs', isSelected ? 'text-black/60' : 'text-gray-400')}>
                        {PRIORITY_DESCRIPTIONS[priority]}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-4 border-t border-gray-100" />

        {/* 필수 지출 카테고리 */}
        <div className="px-4 pt-5 pb-4">
          <SectionLabel>필수 지출 카테고리</SectionLabel>
          <p className="mb-3 text-xs text-gray-400">
            선택한 카테고리는 항상 &quot;무죄&quot;로 판정됩니다
          </p>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = essentialCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 transition-colors',
                    isSelected
                      ? 'bg-[var(--pixel-lime)] text-black'
                      : 'text-black',
                  )}
                >
                  {CATEGORY_ICONS[cat as Category]}
                  <span className="text-xs">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-4 border-t border-gray-100" />

        {/* 유죄 판정 기준 */}
        <div className="px-4 pt-5 pb-4">
          <SectionLabel>유죄 판정 기준</SectionLabel>
          <InfoRow label="고액 지출" value="월 수입의 5% 초과" />
          <InfoRow label="외식 빈도" value="월 8회 초과" />
          <InfoRow label="커피 빈도" value="월 15회 초과" />
          <InfoRow label="술 빈도" value="월 8회 초과" />
          <InfoRow label="배달음식 빈도" value="월 12회 초과" />
          <InfoRow label="식비 예산" value="월 수입의 15%" />
          <InfoRow label="쇼핑 예산" value="월 수입의 10%" />
          <InfoRow label="문화/여가 예산" value="월 수입의 10%" />
          <InfoRow label="목표 위험" value="일일 예산의 3배 초과" last />
          <p className="mt-3 text-xs text-gray-400">* 우선순위 선택 시 기준이 완화됩니다</p>
        </div>

        {/* 저장 버튼 */}
        <div className="px-4 pt-2">
          <Button
            variant={saved ? 'pixel-lime' : 'pixel-lime'}
            className="w-full"
            onClick={handleSave}
            disabled={isReanalyzing}
          >
            {isReanalyzing ? '재분석 중...' : saved ? '저장되었습니다 ✓' : '저장하기'}
          </Button>
        </div>
      </div>
    </>
  );
}
