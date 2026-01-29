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

const STEPS: Step[] = ['welcome', 'income', 'savings', 'priorities', 'complete'];

// 마스코트 - 귀여운 돼지저금통
function Mascot({ className, expression = 'happy' }: { className?: string; expression?: 'happy' | 'excited' | 'thinking' }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none">
      {/* 몸통 */}
      <ellipse cx="60" cy="65" rx="45" ry="40" fill="#FFB6C1" />
      {/* 귀 */}
      <ellipse cx="30" cy="35" rx="12" ry="15" fill="#FFB6C1" />
      <ellipse cx="90" cy="35" rx="12" ry="15" fill="#FFB6C1" />
      <ellipse cx="30" cy="35" rx="8" ry="10" fill="#FF91A4" />
      <ellipse cx="90" cy="35" rx="8" ry="10" fill="#FF91A4" />
      {/* 코 */}
      <ellipse cx="60" cy="70" rx="18" ry="14" fill="#FF91A4" />
      <circle cx="54" cy="70" r="4" fill="#FFB6C1" />
      <circle cx="66" cy="70" r="4" fill="#FFB6C1" />
      {/* 눈 */}
      {expression === 'happy' && (
        <>
          <ellipse cx="42" cy="55" rx="6" ry="7" fill="#333" />
          <ellipse cx="78" cy="55" rx="6" ry="7" fill="#333" />
          <circle cx="44" cy="53" r="2" fill="white" />
          <circle cx="80" cy="53" r="2" fill="white" />
        </>
      )}
      {expression === 'excited' && (
        <>
          <path d="M36 52 Q42 58 48 52" stroke="#333" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M72 52 Q78 58 84 52" stroke="#333" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      )}
      {expression === 'thinking' && (
        <>
          <ellipse cx="42" cy="55" rx="6" ry="7" fill="#333" />
          <ellipse cx="78" cy="55" rx="6" ry="7" fill="#333" />
          <circle cx="44" cy="53" r="2" fill="white" />
          <circle cx="80" cy="53" r="2" fill="white" />
          <ellipse cx="42" cy="55" rx="6" ry="3" fill="#333" transform="rotate(-10 42 55)" />
        </>
      )}
      {/* 볼 터치 */}
      <ellipse cx="28" cy="65" rx="8" ry="5" fill="#FF91A4" opacity="0.5" />
      <ellipse cx="92" cy="65" rx="8" ry="5" fill="#FF91A4" opacity="0.5" />
      {/* 동전 슬롯 */}
      <rect x="50" y="25" width="20" height="6" rx="3" fill="#FF91A4" />
    </svg>
  );
}

// 프로그레스 바
function ProgressBar({ current, total }: { current: number; total: number }) {
  const progress = (current / total) * 100;
  return (
    <div className="w-full h-4 bg-[#e5e5e5] rounded-full overflow-hidden">
      <div
        className="h-full bg-[#58cc02] rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
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

  const currentStepIndex = STEPS.indexOf(step);

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
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setStep(STEPS[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(STEPS[prevIndex]);
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
    updateUserSettings({ onboardingCompleted: true });
    router.push('/');
  };

  const formatNumber = (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) return '0';
    return num.toLocaleString();
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="min-h-screen flex flex-col max-w-md mx-auto">
        {/* 헤더 - 프로그레스 바 */}
        {step !== 'welcome' && step !== 'complete' && (
          <div className="px-4 pt-4 pb-2 flex items-center gap-4">
            <button onClick={handleBack} className="p-2 -ml-2 text-[#afafaf]">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <ProgressBar current={currentStepIndex} total={STEPS.length - 1} />
            </div>
            <button onClick={handleSkip} className="text-[#afafaf] font-bold text-sm">
              건너뛰기
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col px-6 py-8">
          {/* Welcome */}
          {step === 'welcome' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Mascot className="w-40 h-40 mb-8 animate-bounce" expression="excited" />
              <h1 className="text-3xl font-black text-[#4b4b4b] mb-4">
                소비 습관을<br />바꿔볼까요?
              </h1>
              <p className="text-[#777] text-lg mb-12">
                매일 5분, 현명한 소비 습관 만들기
              </p>

              <button
                onClick={handleNext}
                className="w-full py-4 bg-[#58cc02] hover:bg-[#4caf00] text-white rounded-2xl text-lg font-bold shadow-[0_5px_0_#46a302] active:shadow-[0_2px_0_#46a302] active:translate-y-[3px] transition-all"
              >
                시작하기
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-4 text-[#1cb0f6] font-bold mt-4"
              >
                이미 계정이 있어요
              </button>
            </div>
          )}

          {/* Income */}
          {step === 'income' && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col items-center pt-8">
                <Mascot className="w-24 h-24 mb-6" expression="thinking" />
                <h1 className="text-2xl font-black text-[#4b4b4b] text-center mb-8">
                  월 수입이 얼마예요?
                </h1>

                <div className="w-full bg-[#f7f7f7] rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-black text-[#4b4b4b]">
                      {formatNumber(monthlyIncome) || '0'}
                    </span>
                    <span className="text-2xl font-bold text-[#afafaf]">원</span>
                  </div>
                </div>

                {/* 숫자 키패드 */}
                <div className="grid grid-cols-3 gap-3 w-full">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '←'].map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (key === '←') {
                          setMonthlyIncome((prev) => prev.slice(0, -1));
                        } else {
                          setMonthlyIncome((prev) => prev + key);
                        }
                      }}
                      className="py-5 text-2xl font-bold text-[#4b4b4b] bg-white border-2 border-[#e5e5e5] rounded-xl active:bg-[#e5e5e5] transition-colors"
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
                  'w-full py-4 rounded-2xl text-lg font-bold transition-all',
                  monthlyIncome
                    ? 'bg-[#58cc02] text-white shadow-[0_5px_0_#46a302] active:shadow-[0_2px_0_#46a302] active:translate-y-[3px]'
                    : 'bg-[#e5e5e5] text-[#afafaf]'
                )}
              >
                계속하기
              </button>
            </div>
          )}

          {/* Savings */}
          {step === 'savings' && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col items-center pt-8">
                <Mascot className="w-24 h-24 mb-6" expression="happy" />
                <h1 className="text-2xl font-black text-[#4b4b4b] text-center mb-2">
                  매달 얼마를 모을까요?
                </h1>
                <p className="text-[#afafaf] mb-6">저축 목표를 설정해보세요</p>

                <div className="w-full bg-[#f7f7f7] rounded-2xl p-6 mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-black text-[#4b4b4b]">
                      {formatNumber(savingsGoal) || '0'}
                    </span>
                    <span className="text-2xl font-bold text-[#afafaf]">원</span>
                  </div>
                </div>

                {monthlyIncome && savingsGoal && (
                  <div className="w-full bg-[#fff4d4] rounded-2xl p-4 mb-4 text-center">
                    <p className="text-[#ff9600] font-bold">
                      사용 가능: 월 {(parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)).toLocaleString()}원
                    </p>
                  </div>
                )}

                {/* 숫자 키패드 */}
                <div className="grid grid-cols-3 gap-3 w-full">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '←'].map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (key === '←') {
                          setSavingsGoal((prev) => prev.slice(0, -1));
                        } else {
                          setSavingsGoal((prev) => prev + key);
                        }
                      }}
                      className="py-5 text-2xl font-bold text-[#4b4b4b] bg-white border-2 border-[#e5e5e5] rounded-xl active:bg-[#e5e5e5] transition-colors"
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
                  'w-full py-4 rounded-2xl text-lg font-bold transition-all',
                  savingsGoal
                    ? 'bg-[#58cc02] text-white shadow-[0_5px_0_#46a302] active:shadow-[0_2px_0_#46a302] active:translate-y-[3px]'
                    : 'bg-[#e5e5e5] text-[#afafaf]'
                )}
              >
                계속하기
              </button>
            </div>
          )}

          {/* Priorities */}
          {step === 'priorities' && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 pt-4">
                <h1 className="text-2xl font-black text-[#4b4b4b] text-center mb-2">
                  어디에 돈 쓸 때 행복해요?
                </h1>
                <p className="text-[#afafaf] text-center mb-6">최대 3개 선택</p>

                <div className="space-y-3">
                  {PRIORITIES.map((priority) => {
                    const isSelected = selectedPriorities.includes(priority);
                    const isDisabled = !isSelected && selectedPriorities.length >= 3;

                    return (
                      <button
                        key={priority}
                        onClick={() => !isDisabled && togglePriority(priority)}
                        disabled={isDisabled}
                        className={cn(
                          'w-full p-4 rounded-2xl text-left transition-all border-2',
                          isSelected
                            ? 'border-[#58cc02] bg-[#d7ffb8]'
                            : 'border-[#e5e5e5] bg-white',
                          isDisabled && 'opacity-50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all',
                              isSelected
                                ? 'border-[#58cc02] bg-[#58cc02]'
                                : 'border-[#e5e5e5]'
                            )}
                          >
                            {isSelected && (
                              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="3">
                                <path d="M2 8l4 4 8-8" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[#4b4b4b]">{priority}</p>
                            <p className="text-sm text-[#afafaf]">
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
                className="w-full py-4 bg-[#58cc02] text-white rounded-2xl text-lg font-bold shadow-[0_5px_0_#46a302] active:shadow-[0_2px_0_#46a302] active:translate-y-[3px] transition-all mt-6"
              >
                계속하기
              </button>
            </div>
          )}

          {/* Complete */}
          {step === 'complete' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="relative mb-8">
                <Mascot className="w-32 h-32" expression="excited" />
                {/* 축하 이펙트 */}
                <div className="absolute -top-4 -left-4 text-3xl animate-bounce">🎉</div>
                <div className="absolute -top-2 -right-4 text-2xl animate-bounce delay-100">✨</div>
                <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce delay-200">⭐</div>
              </div>

              <h1 className="text-3xl font-black text-[#4b4b4b] mb-2">
                완벽해요!
              </h1>
              <p className="text-[#777] text-lg mb-8">
                이제 현명한 소비를 시작해볼까요?
              </p>

              <div className="w-full space-y-3 mb-8">
                <div className="bg-[#f7f7f7] rounded-2xl p-4 flex justify-between">
                  <span className="text-[#777]">월 수입</span>
                  <span className="font-bold text-[#4b4b4b]">
                    {parseInt(monthlyIncome, 10).toLocaleString()}원
                  </span>
                </div>
                <div className="bg-[#f7f7f7] rounded-2xl p-4 flex justify-between">
                  <span className="text-[#777]">저축 목표</span>
                  <span className="font-bold text-[#4b4b4b]">
                    {parseInt(savingsGoal, 10).toLocaleString()}원
                  </span>
                </div>
                <div className="bg-[#d7ffb8] rounded-2xl p-4 flex justify-between">
                  <span className="text-[#58a700]">사용 가능</span>
                  <span className="font-bold text-[#58a700]">
                    {(parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)).toLocaleString()}원
                  </span>
                </div>
                {selectedPriorities.length > 0 && (
                  <div className="bg-[#f7f7f7] rounded-2xl p-4">
                    <p className="text-[#777] text-sm mb-2">우선순위</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPriorities.map((priority) => (
                        <span
                          key={priority}
                          className="px-3 py-1 bg-[#1cb0f6] text-white text-sm font-bold rounded-full"
                        >
                          {priority}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleComplete}
                className="w-full py-4 bg-[#58cc02] text-white rounded-2xl text-lg font-bold shadow-[0_5px_0_#46a302] active:shadow-[0_2px_0_#46a302] active:translate-y-[3px] transition-all"
              >
                시작하기!
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
