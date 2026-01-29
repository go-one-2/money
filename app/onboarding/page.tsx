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

// 유기적 형태 그래픽
function OrganicShape({ variant = 1, className }: { variant?: number; className?: string }) {
  if (variant === 1) {
    // 메인 연결 형태
    return (
      <svg viewBox="0 0 300 400" className={className} fill="currentColor">
        <path d="
          M 50 50
          Q 50 0 100 0
          L 200 0
          Q 250 0 250 50
          L 250 100
          Q 250 150 300 150
          L 300 200
          Q 300 250 250 250
          L 250 350
          Q 250 400 200 400
          L 100 400
          Q 50 400 50 350
          L 50 250
          Q 50 200 0 200
          L 0 150
          Q 0 100 50 100
          Z
        " />
      </svg>
    );
  }
  if (variant === 2) {
    // 작은 연결 조각
    return (
      <svg viewBox="0 0 200 80" className={className} fill="currentColor">
        <path d="
          M 40 0
          Q 0 0 0 40
          Q 0 80 40 80
          L 160 80
          Q 200 80 200 40
          Q 200 0 160 0
          Z
        " />
      </svg>
    );
  }
  // 원형 조각
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <circle cx="50" cy="50" r="50" />
    </svg>
  );
}

// 라벨 컴포넌트
function PillLabel({ children, color = 'white', className }: {
  children: React.ReactNode;
  color?: 'white' | 'lime';
  className?: string;
}) {
  return (
    <div className={cn(
      'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium',
      color === 'white' ? 'bg-white text-black' : 'bg-[#d4ff00] text-black',
      className
    )}>
      {children}
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
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <div className="min-h-screen flex flex-col max-w-md mx-auto relative">

        {/* Welcome */}
        {step === 'welcome' && (
          <div className="flex-1 flex flex-col p-6">
            {/* 상단 네비 */}
            <div className="flex items-center justify-between text-xs text-white/40 tracking-widest py-4">
              <span>소비</span>
              <span>· · · · ·</span>
              <span>판단</span>
              <span>· · · · ·</span>
              <span>2024</span>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {/* 유기적 형태 그래픽 */}
              <div className="relative w-64 h-80">
                <OrganicShape variant={1} className="w-full h-full text-[#a8a4e6]" />

                {/* 라벨들 */}
                <div className="absolute -top-2 right-0">
                  <PillLabel>소비 분석</PillLabel>
                </div>
                <div className="absolute top-1/4 -left-16">
                  <PillLabel color="lime">AI 판단</PillLabel>
                </div>
                <div className="absolute bottom-1/4 -right-12">
                  <PillLabel>
                    <span className="font-bold text-lg mr-1">100%</span>
                    <span className="text-black/60">맞춤형</span>
                  </PillLabel>
                </div>
              </div>

              {/* 타이틀 */}
              <div className="text-center mt-12">
                <h1 className="text-4xl font-bold mb-3">
                  소비 판단
                </h1>
                <p className="text-white/50">
                  현명한 소비 습관을 만들어요
                </p>
              </div>
            </div>

            {/* 버튼 */}
            <div className="space-y-3">
              <button
                onClick={handleNext}
                className="w-full py-4 bg-[#d4ff00] text-black rounded-full font-semibold hover:bg-[#c4ef00] transition-colors"
              >
                시작하기
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-3 text-white/40 text-sm"
              >
                건너뛰기
              </button>
            </div>
          </div>
        )}

        {/* Income */}
        {step === 'income' && (
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between py-4">
              <button onClick={handleBack} className="text-white/50 text-sm">← 이전</button>
              <div className="flex gap-1">
                <div className="w-8 h-1 bg-[#a8a4e6] rounded-full" />
                <div className="w-8 h-1 bg-white/20 rounded-full" />
                <div className="w-8 h-1 bg-white/20 rounded-full" />
                <div className="w-8 h-1 bg-white/20 rounded-full" />
              </div>
              <button onClick={handleSkip} className="text-white/50 text-sm">건너뛰기</button>
            </div>

            <div className="flex-1 flex flex-col">
              {/* 그래픽 */}
              <div className="relative h-40 flex items-center justify-center my-8">
                <OrganicShape variant={2} className="w-48 h-20 text-[#a8a4e6]" />
                <div className="absolute">
                  <span className="text-3xl font-bold">01</span>
                </div>
              </div>

              {/* 질문 */}
              <h2 className="text-2xl font-bold text-center mb-8">
                월 수입이 얼마인가요?
              </h2>

              {/* 입력 영역 */}
              <div className="bg-white/5 rounded-3xl p-6 mb-6">
                <p className="text-white/40 text-xs mb-3">월 수입 (세후)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    {formatNumber(monthlyIncome) || '0'}
                  </span>
                  <span className="text-xl text-white/50">원</span>
                </div>
              </div>

              {/* 키패드 */}
              <div className="grid grid-cols-3 gap-2 flex-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '←'].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === '←') setMonthlyIncome((prev) => prev.slice(0, -1));
                      else setMonthlyIncome((prev) => prev + key);
                    }}
                    className="py-5 text-xl font-medium rounded-2xl bg-white/5 hover:bg-white/10 active:bg-[#a8a4e6] active:text-black transition-colors"
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
                'w-full py-4 rounded-full font-semibold transition-colors mt-6',
                monthlyIncome
                  ? 'bg-[#d4ff00] text-black'
                  : 'bg-white/10 text-white/30'
              )}
            >
              다음
            </button>
          </div>
        )}

        {/* Savings */}
        {step === 'savings' && (
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between py-4">
              <button onClick={handleBack} className="text-white/50 text-sm">← 이전</button>
              <div className="flex gap-1">
                <div className="w-8 h-1 bg-[#a8a4e6] rounded-full" />
                <div className="w-8 h-1 bg-[#a8a4e6] rounded-full" />
                <div className="w-8 h-1 bg-white/20 rounded-full" />
                <div className="w-8 h-1 bg-white/20 rounded-full" />
              </div>
              <button onClick={handleSkip} className="text-white/50 text-sm">건너뛰기</button>
            </div>

            <div className="flex-1 flex flex-col">
              {/* 그래픽 */}
              <div className="relative h-40 flex items-center justify-center my-8">
                <OrganicShape variant={3} className="w-24 h-24 text-[#d4ff00]" />
                <div className="absolute">
                  <span className="text-3xl font-bold text-black">02</span>
                </div>
              </div>

              {/* 질문 */}
              <h2 className="text-2xl font-bold text-center mb-8">
                매달 얼마를 모을까요?
              </h2>

              {/* 입력 영역 */}
              <div className="bg-white/5 rounded-3xl p-6 mb-4">
                <p className="text-white/40 text-xs mb-3">저축 목표</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    {formatNumber(savingsGoal) || '0'}
                  </span>
                  <span className="text-xl text-white/50">원</span>
                </div>
              </div>

              {/* 사용 가능 예산 */}
              {monthlyIncome && savingsGoal && (
                <div className="flex items-center gap-3 mb-4">
                  <OrganicShape variant={2} className="w-32 h-10 text-[#d4ff00]" />
                  <div className="flex-1 bg-[#d4ff00] text-black rounded-full px-4 py-2 text-sm font-medium">
                    사용 가능: {(parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)).toLocaleString()}원
                  </div>
                </div>
              )}

              {/* 키패드 */}
              <div className="grid grid-cols-3 gap-2 flex-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '←'].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === '←') setSavingsGoal((prev) => prev.slice(0, -1));
                      else setSavingsGoal((prev) => prev + key);
                    }}
                    className="py-5 text-xl font-medium rounded-2xl bg-white/5 hover:bg-white/10 active:bg-[#a8a4e6] active:text-black transition-colors"
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
                'w-full py-4 rounded-full font-semibold transition-colors mt-6',
                savingsGoal
                  ? 'bg-[#d4ff00] text-black'
                  : 'bg-white/10 text-white/30'
              )}
            >
              다음
            </button>
          </div>
        )}

        {/* Priorities */}
        {step === 'priorities' && (
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between py-4">
              <button onClick={handleBack} className="text-white/50 text-sm">← 이전</button>
              <div className="flex gap-1">
                <div className="w-8 h-1 bg-[#a8a4e6] rounded-full" />
                <div className="w-8 h-1 bg-[#a8a4e6] rounded-full" />
                <div className="w-8 h-1 bg-[#a8a4e6] rounded-full" />
                <div className="w-8 h-1 bg-white/20 rounded-full" />
              </div>
              <button onClick={handleSkip} className="text-white/50 text-sm">건너뛰기</button>
            </div>

            <div className="flex-1 flex flex-col">
              {/* 헤더 */}
              <div className="flex items-center gap-4 mb-6">
                <OrganicShape variant={3} className="w-12 h-12 text-[#a8a4e6]" />
                <div>
                  <h2 className="text-xl font-bold">어디에 쓸 때 행복해요?</h2>
                  <p className="text-white/40 text-sm">최대 3개 선택</p>
                </div>
              </div>

              {/* 우선순위 리스트 */}
              <div className="flex-1 overflow-auto space-y-3">
                {PRIORITIES.map((priority) => {
                  const isSelected = selectedPriorities.includes(priority);
                  const isDisabled = !isSelected && selectedPriorities.length >= 3;

                  return (
                    <button
                      key={priority}
                      onClick={() => !isDisabled && togglePriority(priority)}
                      disabled={isDisabled}
                      className={cn(
                        'w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4',
                        isSelected
                          ? 'bg-[#a8a4e6] text-black'
                          : 'bg-white/5 hover:bg-white/10',
                        isDisabled && 'opacity-30'
                      )}
                    >
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center',
                        isSelected ? 'bg-black' : 'bg-white/10'
                      )}>
                        {isSelected && (
                          <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2">
                            <path d="M2 7l3 3 7-7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{priority}</p>
                        <p className={cn(
                          'text-sm mt-0.5',
                          isSelected ? 'text-black/60' : 'text-white/40'
                        )}>
                          {PRIORITY_DESCRIPTIONS[priority]}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 bg-[#d4ff00] text-black rounded-full font-semibold mt-6"
            >
              다음
            </button>
          </div>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between py-4">
              <button onClick={handleBack} className="text-white/50 text-sm">← 이전</button>
              <div className="flex gap-1">
                <div className="w-8 h-1 bg-[#a8a4e6] rounded-full" />
                <div className="w-8 h-1 bg-[#a8a4e6] rounded-full" />
                <div className="w-8 h-1 bg-[#a8a4e6] rounded-full" />
                <div className="w-8 h-1 bg-[#d4ff00] rounded-full" />
              </div>
              <span className="text-white/50 text-sm">완료</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              {/* 완료 그래픽 */}
              <div className="relative mb-8">
                <OrganicShape variant={1} className="w-48 h-64 text-[#a8a4e6]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-[#d4ff00] rounded-full p-4">
                    <svg width="40" height="40" fill="none" stroke="black" strokeWidth="3">
                      <path d="M8 20l8 8 16-16" />
                    </svg>
                  </div>
                </div>
                {/* 플로팅 라벨 */}
                <PillLabel className="absolute -top-2 -right-8">완료!</PillLabel>
              </div>

              <h2 className="text-2xl font-bold mb-8">준비가 완료되었어요</h2>

              {/* 요약 */}
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4">
                  <span className="text-white/50">월 수입</span>
                  <span className="font-bold">{parseInt(monthlyIncome, 10).toLocaleString()}원</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4">
                  <span className="text-white/50">저축 목표</span>
                  <span className="font-bold">{parseInt(savingsGoal, 10).toLocaleString()}원</span>
                </div>
                <div className="flex items-center justify-between bg-[#d4ff00] text-black rounded-2xl p-4">
                  <span className="text-black/60">사용 가능</span>
                  <span className="font-bold">{(parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)).toLocaleString()}원</span>
                </div>
                {selectedPriorities.length > 0 && (
                  <div className="bg-white/5 rounded-2xl p-4">
                    <p className="text-white/50 text-sm mb-2">우선순위</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPriorities.map((priority) => (
                        <span
                          key={priority}
                          className="px-3 py-1 bg-[#a8a4e6] text-black text-sm font-medium rounded-full"
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
              className="w-full py-4 bg-[#d4ff00] text-black rounded-full font-semibold"
            >
              시작하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
