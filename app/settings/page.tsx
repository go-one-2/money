'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
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

type View = 'main' | 'finance' | 'priority' | 'categories' | 'criteria';

// ── 공통 컴포넌트 ────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
      {children}
    </p>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between py-3', !last && 'border-b border-gray-100')}>
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-black">{value}</span>
    </div>
  );
}

// ── 서브뷰 래퍼 ──────────────────────────────────────────────────
interface SubViewProps {
  title: string;
  isOpen: boolean;
  onBack: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  saved?: boolean;
  children: React.ReactNode;
}

function SubView({ title, isOpen, onBack, onSave, isSaving, saved, children }: SubViewProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [isOpen]);

  if (!isOpen && !visible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] flex flex-col transition-transform duration-300 ease-out',
        visible ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      {/* 서브뷰 헤더 */}
      <header className="flex h-14 shrink-0 items-center bg-background px-4">
        <button onClick={onBack} className="-ml-2 p-2 text-foreground">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="pixel-font text-lg text-foreground">{title}</h1>
      </header>

      {/* 서브뷰 컨텐츠 */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        <div className="flex-1 overflow-auto">{children}</div>

        {onSave && (
          <div className="px-4 pb-6 pt-2">
            <Button
              variant="pixel-lime"
              className="w-full"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? '저장 중...' : saved ? '저장되었습니다 ✓' : '저장하기'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────
export default function SettingsPage() {
  const { userSettings, updateUserSettings, reanalyzeAllExpenses } = useExpenseStore();

  const [view, setView] = useState<View>('main');
  const [monthlyIncome, setMonthlyIncome] = useState(userSettings.monthlyIncome.toString());
  const [savingsGoal, setSavingsGoal] = useState(userSettings.savingsGoal.toString());
  const [essentialCategories, setEssentialCategories] = useState<Category[]>(
    userSettings.essentialCategories,
  );
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>(
    userSettings.priorities || [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMonthlyIncome(userSettings.monthlyIncome.toString());
    setSavingsGoal(userSettings.savingsGoal.toString());
    setEssentialCategories(userSettings.essentialCategories);
    setSelectedPriorities(userSettings.priorities || []);
  }, [userSettings]);

  const handleSave = async () => {
    updateUserSettings({
      monthlyIncome: parseInt(monthlyIncome, 10) || 0,
      savingsGoal: parseInt(savingsGoal, 10) || 0,
      essentialCategories,
      priorities: selectedPriorities,
    });
    setIsSaving(true);
    try {
      await reanalyzeAllExpenses();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const goBack = () => setView('main');

  const income = parseInt(monthlyIncome, 10) || 0;
  const savings = parseInt(savingsGoal, 10) || 0;
  const availableBudget = income - savings;

  const toggleCategory = (cat: Category) =>
    setEssentialCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );

  const togglePriority = (p: Priority) =>
    setSelectedPriorities((prev) => {
      if (prev.includes(p)) return prev.filter((x) => x !== p);
      if (prev.length >= 3) return prev;
      return [...prev, p];
    });

  // 섹션 요약 텍스트
  const financeSummary =
    income > 0 ? `수입 ${income.toLocaleString()}원` : '미설정';
  const prioritySummary =
    selectedPriorities.length > 0
      ? selectedPriorities.slice(0, 2).join(', ') +
        (selectedPriorities.length > 2 ? ` 외 ${selectedPriorities.length - 2}개` : '')
      : '선택 없음';
  const categorySummary =
    essentialCategories.length > 0
      ? essentialCategories.slice(0, 2).join(', ') +
        (essentialCategories.length > 2 ? ` 외 ${essentialCategories.length - 2}개` : '')
      : '선택 없음';

  return (
    <>
      <Header title="설정" />

      {/* 히어로 */}
      <div className="bg-background px-5 pb-8 pt-6">
        <p className="mb-1 text-xs tracking-wide text-muted-foreground">사용 가능 예산</p>
        <p className="pixel-number mb-2 text-5xl leading-none text-primary">
          {availableBudget > 0 ? `${availableBudget.toLocaleString()}원` : '—'}
        </p>
        <p className="text-xs text-muted-foreground">
          수입 {income > 0 ? `${income.toLocaleString()}원` : '미설정'} · 저축{' '}
          {savings > 0 ? `${savings.toLocaleString()}원` : '미설정'}
        </p>
      </div>

      {/* 설정 목록 */}
      <div className="min-h-screen bg-white">
        <div className="px-4 pt-5">
          <SectionLabel>설정</SectionLabel>
        </div>

        {[
          {
            key: 'finance' as View,
            label: '재정 정보',
            summary: financeSummary,
          },
          {
            key: 'priority' as View,
            label: '소비 우선순위',
            summary: prioritySummary,
          },
          {
            key: 'categories' as View,
            label: '필수 지출 카테고리',
            summary: categorySummary,
          },
          {
            key: 'criteria' as View,
            label: '유죄 판정 기준',
            summary: '9가지 기준',
          },
        ].map((item, i, arr) => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className={cn(
              'flex w-full items-center justify-between px-4 py-4 transition-colors active:bg-gray-50',
              i < arr.length - 1 && 'border-b border-gray-100',
            )}
          >
            <div className="text-left">
              <p className="text-base font-medium text-black">{item.label}</p>
              <p className="mt-0.5 text-xs text-gray-400">{item.summary}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
          </button>
        ))}
      </div>

      {/* ── 서브뷰: 재정 정보 ── */}
      <SubView
        title="재정 정보"
        isOpen={view === 'finance'}
        onBack={goBack}
        onSave={handleSave}
        isSaving={isSaving}
        saved={saved}
      >
        <div className="px-4 pt-5">
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
          {availableBudget > 0 && (
            <p className="mt-1 text-xs text-[#84a900]">
              사용 가능 예산 {availableBudget.toLocaleString()}원/월
            </p>
          )}
        </div>
      </SubView>

      {/* ── 서브뷰: 소비 우선순위 ── */}
      <SubView
        title="소비 우선순위"
        isOpen={view === 'priority'}
        onBack={goBack}
        onSave={handleSave}
        isSaving={isSaving}
        saved={saved}
      >
        <div className="px-4 pt-5">
          <SectionLabel>소비 우선순위</SectionLabel>
          <p className="mb-4 text-xs text-gray-400">
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
                    isSelected ? 'border-[var(--pixel-lime)] bg-[var(--pixel-lime)]' : 'border-gray-200 bg-white',
                    isDisabled && 'cursor-not-allowed opacity-40',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center border-2', isSelected ? 'border-black bg-black' : 'border-gray-300')}>
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="square">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">{priority}</p>
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
      </SubView>

      {/* ── 서브뷰: 필수 지출 카테고리 ── */}
      <SubView
        title="필수 지출 카테고리"
        isOpen={view === 'categories'}
        onBack={goBack}
        onSave={handleSave}
        isSaving={isSaving}
        saved={saved}
      >
        <div className="px-4 pt-5">
          <SectionLabel>필수 지출 카테고리</SectionLabel>
          <p className="mb-4 text-xs text-gray-400">
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
                    isSelected ? 'bg-[var(--pixel-lime)] text-black' : 'text-black',
                  )}
                >
                  {CATEGORY_ICONS[cat as Category]}
                  <span className="text-xs">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </SubView>

      {/* ── 서브뷰: 유죄 판정 기준 ── */}
      <SubView
        title="유죄 판정 기준"
        isOpen={view === 'criteria'}
        onBack={goBack}
      >
        <div className="px-4 pt-5">
          <SectionLabel>판정 기준</SectionLabel>
          <InfoRow label="고액 지출" value="월 수입의 5% 초과" />
          <InfoRow label="외식 빈도" value="월 8회 초과" />
          <InfoRow label="커피 빈도" value="월 15회 초과" />
          <InfoRow label="술 빈도" value="월 8회 초과" />
          <InfoRow label="배달음식 빈도" value="월 12회 초과" />
          <InfoRow label="식비 예산" value="월 수입의 15%" />
          <InfoRow label="쇼핑 예산" value="월 수입의 10%" />
          <InfoRow label="문화/여가 예산" value="월 수입의 10%" />
          <InfoRow label="목표 위험" value="일일 예산의 3배 초과" last />
          <p className="mt-4 text-xs text-gray-400">* 우선순위 선택 시 기준이 완화됩니다</p>
        </div>
      </SubView>
    </>
  );
}
