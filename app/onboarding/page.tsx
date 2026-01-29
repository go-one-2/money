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

// 픽셀 구름 컴포넌트
function PixelCloud({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      className={cn('w-16 h-10', className)}
      fill="currentColor"
    >
      <rect x="20" y="8" width="8" height="8" />
      <rect x="28" y="0" width="8" height="8" />
      <rect x="36" y="8" width="8" height="8" />
      <rect x="12" y="16" width="8" height="8" />
      <rect x="20" y="16" width="8" height="8" />
      <rect x="28" y="16" width="8" height="8" />
      <rect x="36" y="16" width="8" height="8" />
      <rect x="44" y="16" width="8" height="8" />
      <rect x="8" y="24" width="8" height="8" />
      <rect x="16" y="24" width="8" height="8" />
      <rect x="24" y="24" width="8" height="8" />
      <rect x="32" y="24" width="8" height="8" />
      <rect x="40" y="24" width="8" height="8" />
      <rect x="48" y="24" width="8" height="8" />
    </svg>
  );
}

// 픽셀 집 컴포넌트
function PixelHouse({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('w-12 h-12', className)}
      fill="currentColor"
    >
      <rect x="20" y="4" width="8" height="8" fill="#c8e600" />
      <rect x="12" y="12" width="8" height="8" />
      <rect x="20" y="12" width="8" height="8" />
      <rect x="28" y="12" width="8" height="8" />
      <rect x="8" y="20" width="8" height="8" />
      <rect x="16" y="20" width="8" height="8" />
      <rect x="24" y="20" width="8" height="8" />
      <rect x="32" y="20" width="8" height="8" />
      <rect x="8" y="28" width="8" height="16" />
      <rect x="16" y="28" width="8" height="16" />
      <rect x="24" y="28" width="8" height="16" />
      <rect x="32" y="28" width="8" height="16" />
      <rect x="20" y="36" width="8" height="8" fill="#666" />
    </svg>
  );
}

// 픽셀 장식 요소
function PixelDecor() {
  return (
    <>
      <div className="pixel-decor top-20 left-8 animate-pulse" />
      <div className="pixel-decor top-32 right-12 animate-pulse delay-100" />
      <div className="pixel-decor bottom-40 left-16 animate-pulse delay-200" />
      <div className="pixel-decor top-48 left-4 w-4 h-4 animate-pulse delay-300" />
      <div className="pixel-decor bottom-60 right-8 animate-pulse delay-500" />
    </>
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
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, priority];
    });
  };

  const handleNext = () => {
    if (step === 'welcome') {
      setStep('income');
    } else if (step === 'income') {
      setStep('savings');
    } else if (step === 'savings') {
      setStep('priorities');
    } else if (step === 'priorities') {
      setStep('complete');
    }
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
    updateUserSettings({
      onboardingCompleted: true,
    });
    router.push('/');
  };

  return (
    <main className="pixel-theme min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <PixelDecor />

      {/* 상단 장식 */}
      <div className="absolute top-8 right-8 text-white/20 pixel-float">
        <PixelCloud />
      </div>
      <div className="absolute top-24 left-12 text-white/10 pixel-float" style={{ animationDelay: '1s' }}>
        <PixelCloud />
      </div>

      <div className="min-h-screen flex flex-col justify-center px-6 py-12 max-w-md mx-auto relative z-10">

        {/* Welcome */}
        {step === 'welcome' && (
          <div className="space-y-8">
            <div className="text-[var(--pixel-lime)] text-sm tracking-wider">
              ※ 안녕 HELLO
            </div>
            <h1 className="text-5xl font-bold leading-tight">
              소비<br />판단!
            </h1>

            <div className="flex items-end gap-4 my-8">
              <div className="text-white/40 pixel-float">
                <PixelCloud />
              </div>
              <div className="pixel-float" style={{ animationDelay: '0.5s' }}>
                <PixelHouse />
              </div>
            </div>

            <div className="pixel-bubble text-black">
              <p className="text-lg">
                당신의 소비를 판단해드릴게요.<br />
                잘한 소비인지, 못한 소비인지!
              </p>
            </div>

            <button
              className="pixel-btn pixel-btn-lime w-full text-lg"
              onClick={handleNext}
            >
              시작하기
            </button>
          </div>
        )}

        {/* Income */}
        {step === 'income' && (
          <div className="space-y-6">
            <div className="text-[var(--pixel-lime)] text-sm">「 01 」</div>

            <div className="pixel-bubble text-black">
              <p className="text-lg font-bold mb-1">월 수입이 얼마인가요?</p>
              <p className="text-sm text-gray-600">세후 실수령액을 알려주세요</p>
            </div>

            <div className="my-8 flex justify-center">
              <div className="text-white/30 pixel-float">
                <PixelCloud />
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder="3,000,000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                inputMode="numeric"
                className="pixel-input w-full text-xl pr-12"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                원
              </span>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                className="pixel-btn flex-1"
                onClick={handleSkip}
              >
                건너뛰기
              </button>
              <button
                className="pixel-btn pixel-btn-lime flex-1"
                onClick={handleNext}
                disabled={!monthlyIncome}
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Savings */}
        {step === 'savings' && (
          <div className="space-y-6">
            <div className="text-[var(--pixel-lime)] text-sm">「 02 」</div>

            <div className="pixel-bubble text-black">
              <p className="text-lg font-bold mb-1">매달 얼마를 모으고 싶으세요?</p>
              <p className="text-sm text-gray-600">저축 목표를 설정해주세요</p>
            </div>

            <div className="my-6 flex justify-end">
              <div className="pixel-float" style={{ animationDelay: '0.3s' }}>
                <PixelHouse className="text-white/30" />
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder="500,000"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                inputMode="numeric"
                className="pixel-input w-full text-xl pr-12"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                원
              </span>
            </div>

            {monthlyIncome && savingsGoal && (
              <div className="text-[var(--pixel-lime)] text-center py-2">
                사용 가능: 월 {(parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)).toLocaleString()}원
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                className="pixel-btn flex-1"
                onClick={() => setStep('income')}
              >
                이전
              </button>
              <button
                className="pixel-btn pixel-btn-lime flex-1"
                onClick={handleNext}
                disabled={!savingsGoal}
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Priorities */}
        {step === 'priorities' && (
          <div className="space-y-6">
            <div className="text-[var(--pixel-lime)] text-sm">「 03 」</div>

            <div className="pixel-bubble text-black">
              <p className="text-lg font-bold mb-1">어떨 때 돈이 아깝지 않나요?</p>
              <p className="text-sm text-gray-600">최대 3개까지 선택 가능</p>
            </div>

            <div className="space-y-3 my-4">
              {PRIORITIES.map((priority) => {
                const isSelected = selectedPriorities.includes(priority);
                const isDisabled = !isSelected && selectedPriorities.length >= 3;

                return (
                  <button
                    key={priority}
                    onClick={() => !isDisabled && togglePriority(priority)}
                    disabled={isDisabled}
                    className={cn(
                      'w-full p-4 text-left transition-all border-3 flex items-center gap-3',
                      'border-white/20 bg-white/5',
                      isSelected && 'border-[var(--pixel-lime)] bg-[var(--pixel-lime)]/10',
                      isDisabled && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <div
                      className={cn(
                        'pixel-checkbox flex-shrink-0',
                        isSelected && 'checked'
                      )}
                    >
                      {isSelected && (
                        <span className="text-black font-bold">✓</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{priority}</p>
                      <p className="text-sm text-white/60">
                        {PRIORITY_DESCRIPTIONS[priority]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                className="pixel-btn flex-1"
                onClick={() => setStep('savings')}
              >
                이전
              </button>
              <button
                className="pixel-btn pixel-btn-lime flex-1"
                onClick={handleNext}
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex gap-4 mb-6">
                <div className="text-[var(--pixel-lime)] pixel-float">
                  <PixelCloud />
                </div>
                <div className="pixel-float" style={{ animationDelay: '0.5s' }}>
                  <PixelHouse className="text-white" />
                </div>
                <div className="text-[var(--pixel-lime)] pixel-float" style={{ animationDelay: '1s' }}>
                  <PixelCloud />
                </div>
              </div>
              <h1 className="text-3xl font-bold">설정 완료!</h1>
            </div>

            <div className="pixel-bubble text-black space-y-4">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">월 수입</span>
                <span className="font-bold">
                  {parseInt(monthlyIncome, 10).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">저축 목표</span>
                <span className="font-bold">
                  {parseInt(savingsGoal, 10).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">사용 가능</span>
                <span className="font-bold text-[#7ab800]">
                  {(parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)).toLocaleString()}원
                </span>
              </div>
              {selectedPriorities.length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-600 text-sm">우선순위</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPriorities.map((priority) => (
                      <span
                        key={priority}
                        className="px-3 py-1 bg-[var(--pixel-lime)] text-black text-sm font-bold"
                      >
                        {priority}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className="pixel-btn pixel-btn-lime w-full text-lg"
              onClick={handleComplete}
            >
              시작하기
            </button>
          </div>
        )}
      </div>

      {/* 하단 픽셀 장식 */}
      <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end">
        <div className="flex w-full">
          {[24, 16, 32, 8, 40, 20, 12, 36, 28, 16, 44, 20, 8, 32, 24, 40, 12, 28, 16, 36].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-white/5"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
