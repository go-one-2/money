'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExpenseStore } from '@/lib/store';
import {
  PRIORITIES,
  PRIORITY_DESCRIPTIONS,
  type Priority,
} from '@/lib/types';
import { cn } from '@/lib/utils';

type Step = 'welcome' | 'income' | 'savings' | 'priorities' | 'complete';

// 기하학적 도형 컴포넌트
function BlobShape({ variant = 1, className }: { variant?: number; className?: string }) {
  if (variant === 1) {
    return (
      <svg viewBox="0 0 200 200" className={className} fill="currentColor">
        <path d="M 0 100 Q 0 0 100 0 Q 200 0 200 100 L 200 200 L 0 200 Z" />
      </svg>
    );
  }
  if (variant === 2) {
    return (
      <svg viewBox="0 0 200 100" className={className} fill="currentColor">
        <path d="M 0 100 Q 0 0 50 0 L 50 0 Q 100 0 100 50 Q 100 100 150 100 Q 200 100 200 50 L 200 100 Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <circle cx="50" cy="50" r="50" />
    </svg>
  );
}

// 그리드 라인 배경
function GridBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 가로 라인 */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 right-0 border-t border-black/10"
          style={{ top: `${(i + 1) * 8}%` }}
        />
      ))}
      {/* 세로 라인 */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`v-${i}`}
          className="absolute top-0 bottom-0 border-l border-black/10"
          style={{ left: `${(i + 1) * 16}%` }}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { updateUserSettings } = useExpenseStore();

  const [step, setStep] = useState<Step>('welcome');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);

  const togglePriority = (priority: Priority) => {
    setSelectedPriorities((prev) => {
      if (prev.includes(priority)) {
        return prev.filter((p) => p !== priority);
      }
      if (prev.length >= 3) return prev;
      return [...prev, priority];
    });
  };

  const handleNext = () => {
    if (step === 'welcome') setStep('income');
    else if (step === 'income') setStep('savings');
    else if (step === 'savings') setStep('priorities');
    else if (step === 'priorities') setStep('complete');
  };

  const handleBack = () => {
    if (step === 'income') setStep('welcome');
    else if (step === 'savings') setStep('income');
    else if (step === 'priorities') setStep('savings');
    else if (step === 'complete') setStep('priorities');
  };

  const handleComplete = () => {
    updateUserSettings({
      monthlyIncome: parseInt(monthlyIncome, 10) || 3000000,
      savingsGoal: parseInt(savingsGoal, 10) || 500000,
      priorities: selectedPriorities,
      onboardingCompleted: true,
    });
    router.push('/');
  };

  const handleSkip = () => {
    updateUserSettings({ onboardingCompleted: true });
    router.push('/');
  };

  const formatNumber = (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) return '0';
    return num.toLocaleString();
  };

  return (
    <main className="min-h-screen bg-[#e8e8e4] text-black relative overflow-hidden">
      <GridBackground />

      <div className="min-h-screen flex flex-col max-w-md mx-auto relative">
        {/* Welcome */}
        {step === 'welcome' && (
          <div className="flex-1 flex flex-col p-6">
            {/* 상단 라벨 */}
            <div className="flex justify-between text-[10px] tracking-wider border-b border-black/20 pb-2 mb-8">
              <span>소비</span>
              <span>판단</span>
              <span>2024</span>
            </div>

            {/* 메인 타이포그래피 */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="relative">
                <BlobShape variant={1} className="absolute -top-8 right-0 w-32 h-32 text-black" />
                <h1 className="text-[80px] font-black leading-[0.85] tracking-tighter">
                  소비
                  <br />
                  <span className="text-[100px]">판단</span>
                </h1>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-2 text-[11px]">
                <div className="border-t border-black/30 pt-2">
                  <p className="text-black/50">Type</p>
                  <p className="font-medium">지출 분석</p>
                </div>
                <div className="border-t border-black/30 pt-2">
                  <p className="text-black/50">Method</p>
                  <p className="font-medium">AI 판단</p>
                </div>
                <div className="border-t border-black/30 pt-2">
                  <p className="text-black/50">Result</p>
                  <p className="font-medium">잘한 / 못한</p>
                </div>
                <div className="border-t border-black/30 pt-2">
                  <p className="text-black/50">Goal</p>
                  <p className="font-medium">현명한 소비</p>
                </div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="space-y-3">
              <button
                onClick={handleNext}
                className="w-full py-4 bg-black text-white text-sm font-medium tracking-wider hover:bg-black/80 transition-colors"
              >
                시작하기
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-3 text-black/50 text-xs tracking-wider"
              >
                건너뛰기
              </button>
            </div>
          </div>
        )}

        {/* Income */}
        {step === 'income' && (
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between border-b border-black/20 pb-2 mb-8">
              <button onClick={handleBack} className="text-xs tracking-wider">← 이전</button>
              <span className="text-[10px] tracking-wider">01 / 04</span>
              <button onClick={handleSkip} className="text-xs text-black/50">건너뛰기</button>
            </div>

            <div className="flex-1 flex flex-col">
              {/* 기하학적 도형 */}
              <div className="relative h-32 mb-8">
                <BlobShape variant={2} className="absolute top-0 left-0 w-full h-24 text-black" />
              </div>

              {/* 질문 */}
              <div className="mb-8">
                <p className="text-[10px] text-black/50 tracking-wider mb-2">MONTHLY INCOME</p>
                <h2 className="text-4xl font-black leading-tight tracking-tight">
                  월 수입이
                  <br />
                  얼마인가요?
                </h2>
              </div>

              {/* 입력 */}
              <div className="border-t border-b border-black py-6 mb-8">
                <p className="text-[10px] text-black/50 tracking-wider mb-4">금액 입력</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tighter">
                    {formatNumber(monthlyIncome) || '0'}
                  </span>
                  <span className="text-xl text-black/50">원</span>
                </div>
              </div>

              {/* 숫자 키패드 */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '←'].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === '←') setMonthlyIncome((prev) => prev.slice(0, -1));
                      else setMonthlyIncome((prev) => prev + key);
                    }}
                    className="py-4 text-lg font-medium border border-black/20 hover:bg-black hover:text-white transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!monthlyIncome}
              className={cn(
                'w-full py-4 text-sm font-medium tracking-wider transition-colors mt-6',
                monthlyIncome ? 'bg-black text-white' : 'bg-black/20 text-black/40'
              )}
            >
              다음
            </button>
          </div>
        )}

        {/* Savings */}
        {step === 'savings' && (
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between border-b border-black/20 pb-2 mb-8">
              <button onClick={handleBack} className="text-xs tracking-wider">← 이전</button>
              <span className="text-[10px] tracking-wider">02 / 04</span>
              <button onClick={handleSkip} className="text-xs text-black/50">건너뛰기</button>
            </div>

            <div className="flex-1 flex flex-col">
              {/* 기하학적 도형 */}
              <div className="relative h-24 mb-8 flex justify-end">
                <BlobShape variant={3} className="w-20 h-20 text-black" />
              </div>

              {/* 질문 */}
              <div className="mb-8">
                <p className="text-[10px] text-black/50 tracking-wider mb-2">SAVINGS GOAL</p>
                <h2 className="text-4xl font-black leading-tight tracking-tight">
                  매달 얼마를
                  <br />
                  모을까요?
                </h2>
              </div>

              {/* 입력 */}
              <div className="border-t border-b border-black py-6 mb-4">
                <p className="text-[10px] text-black/50 tracking-wider mb-4">저축 목표</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tighter">
                    {formatNumber(savingsGoal) || '0'}
                  </span>
                  <span className="text-xl text-black/50">원</span>
                </div>
              </div>

              {/* 사용 가능 예산 */}
              {monthlyIncome && savingsGoal && (
                <div className="bg-black text-white p-4 mb-4">
                  <p className="text-[10px] tracking-wider mb-1">AVAILABLE BUDGET</p>
                  <p className="text-2xl font-black">
                    {(parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)).toLocaleString()}원
                  </p>
                </div>
              )}

              {/* 숫자 키패드 */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '←'].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === '←') setSavingsGoal((prev) => prev.slice(0, -1));
                      else setSavingsGoal((prev) => prev + key);
                    }}
                    className="py-4 text-lg font-medium border border-black/20 hover:bg-black hover:text-white transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!savingsGoal}
              className={cn(
                'w-full py-4 text-sm font-medium tracking-wider transition-colors mt-6',
                savingsGoal ? 'bg-black text-white' : 'bg-black/20 text-black/40'
              )}
            >
              다음
            </button>
          </div>
        )}

        {/* Priorities */}
        {step === 'priorities' && (
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between border-b border-black/20 pb-2 mb-6">
              <button onClick={handleBack} className="text-xs tracking-wider">← 이전</button>
              <span className="text-[10px] tracking-wider">03 / 04</span>
              <button onClick={handleSkip} className="text-xs text-black/50">건너뛰기</button>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="mb-6">
                <p className="text-[10px] text-black/50 tracking-wider mb-2">PRIORITIES · MAX 3</p>
                <h2 className="text-3xl font-black leading-tight tracking-tight">
                  어디에 쓸 때
                  <br />
                  아깝지 않아요?
                </h2>
              </div>

              <div className="flex-1 overflow-auto space-y-2">
                {PRIORITIES.map((priority, index) => {
                  const isSelected = selectedPriorities.includes(priority);
                  const isDisabled = !isSelected && selectedPriorities.length >= 3;

                  return (
                    <button
                      key={priority}
                      onClick={() => !isDisabled && togglePriority(priority)}
                      disabled={isDisabled}
                      className={cn(
                        'w-full p-4 text-left transition-all border',
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-transparent border-black/20 hover:border-black',
                        isDisabled && 'opacity-30'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-[10px] font-mono mt-1">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <p className="font-bold">{priority}</p>
                          <p className={cn('text-xs mt-1', isSelected ? 'text-white/70' : 'text-black/50')}>
                            {PRIORITY_DESCRIPTIONS[priority]}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 bg-black text-white text-sm font-medium tracking-wider mt-6"
            >
              다음
            </button>
          </div>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between border-b border-black/20 pb-2 mb-8">
              <button onClick={handleBack} className="text-xs tracking-wider">← 이전</button>
              <span className="text-[10px] tracking-wider">04 / 04</span>
              <span className="text-xs text-black/50">완료</span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {/* 큰 숫자 */}
              <div className="relative mb-12">
                <BlobShape variant={1} className="absolute -top-4 -right-4 w-24 h-24 text-black" />
                <p className="text-[120px] font-black leading-none tracking-tighter">
                  OK
                </p>
                <p className="text-xl font-medium mt-4">설정이 완료되었습니다</p>
              </div>

              {/* 요약 */}
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-t border-black/20">
                  <span className="text-[10px] tracking-wider text-black/50">INCOME</span>
                  <span className="font-bold">{parseInt(monthlyIncome, 10).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between py-3 border-t border-black/20">
                  <span className="text-[10px] tracking-wider text-black/50">SAVINGS</span>
                  <span className="font-bold">{parseInt(savingsGoal, 10).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between py-3 border-t border-b border-black bg-black text-white -mx-6 px-6">
                  <span className="text-[10px] tracking-wider text-white/70">AVAILABLE</span>
                  <span className="font-bold">
                    {(parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)).toLocaleString()}원
                  </span>
                </div>
                {selectedPriorities.length > 0 && (
                  <div className="py-3 border-b border-black/20">
                    <p className="text-[10px] tracking-wider text-black/50 mb-2">PRIORITIES</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPriorities.map((priority) => (
                        <span
                          key={priority}
                          className="px-3 py-1 border border-black text-sm font-medium"
                        >
                          {priority}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full py-4 bg-black text-white text-sm font-medium tracking-wider"
            >
              시작하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
