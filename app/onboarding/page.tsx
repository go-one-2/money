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

// 파스텔 컬러 배열
const PRIORITY_COLORS = [
  'bg-[#e8dfd5]', // 베이지
  'bg-[#d4c5b5]', // 모카
  'bg-[#c5d5c5]', // 세이지
  'bg-[#d5d0e0]', // 라벤더
  'bg-[#c5ddd5]', // 민트
  'bg-[#e0d5c5]', // 샌드
  'bg-[#d0d5d5]', // 그레이
];

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
    <main className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a]">
      <div className="min-h-screen flex flex-col px-6 py-12 max-w-md mx-auto">

        {/* Welcome */}
        {step === 'welcome' && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-sm text-[#888] mb-4">소비 판단</p>
              <h1 className="text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                잘한<br />
                소비<br />
                <span className="text-[#888]">vs</span><br />
                못한<br />
                소비
              </h1>
              <p className="text-[#666] text-lg mt-8">
                당신의 소비 습관을<br />
                분석해드릴게요
              </p>
            </div>

            <div className="space-y-3 pt-8">
              <button
                onClick={handleNext}
                className="w-full py-4 bg-[#1a1a1a] text-white rounded-full text-lg font-medium"
              >
                시작하기
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-4 text-[#888] text-base"
              >
                건너뛰기
              </button>
            </div>
          </div>
        )}

        {/* Income */}
        {step === 'income' && (
          <div className="flex-1 flex flex-col">
            <button
              onClick={handleBack}
              className="self-start p-2 -ml-2 text-[#888]"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 flex flex-col justify-center -mt-16">
              <p className="text-sm text-[#888] mb-2">01</p>
              <h1 className="text-3xl font-bold mb-12">
                월 수입이<br />얼마인가요?
              </h1>

              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-sm text-[#888] mb-2">월 수입</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight">
                    {formatNumber(monthlyIncome) || '0'}
                  </span>
                  <span className="text-2xl text-[#888]">원</span>
                </div>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="sr-only"
                  autoFocus
                />
              </div>

              {/* 숫자 키패드 */}
              <div className="grid grid-cols-3 gap-3 mt-6">
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
                    className="py-4 text-xl font-medium bg-white rounded-2xl active:bg-[#eee] transition-colors"
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
                'w-full py-4 rounded-full text-lg font-medium transition-colors',
                monthlyIncome
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-[#e5e5e0] text-[#aaa]'
              )}
            >
              다음
            </button>
          </div>
        )}

        {/* Savings */}
        {step === 'savings' && (
          <div className="flex-1 flex flex-col">
            <button
              onClick={handleBack}
              className="self-start p-2 -ml-2 text-[#888]"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 flex flex-col justify-center -mt-16">
              <p className="text-sm text-[#888] mb-2">02</p>
              <h1 className="text-3xl font-bold mb-12">
                매달 얼마를<br />모으고 싶으세요?
              </h1>

              <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
                <p className="text-sm text-[#888] mb-2">저축 목표</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight">
                    {formatNumber(savingsGoal) || '0'}
                  </span>
                  <span className="text-2xl text-[#888]">원</span>
                </div>
              </div>

              {monthlyIncome && savingsGoal && (
                <div className="bg-[#c5d5c5] rounded-2xl p-4 mb-4">
                  <p className="text-sm text-[#555]">사용 가능 예산</p>
                  <p className="text-2xl font-bold">
                    월 {(parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)).toLocaleString()}원
                  </p>
                </div>
              )}

              {/* 숫자 키패드 */}
              <div className="grid grid-cols-3 gap-3 mt-2">
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
                    className="py-4 text-xl font-medium bg-white rounded-2xl active:bg-[#eee] transition-colors"
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
                'w-full py-4 rounded-full text-lg font-medium transition-colors',
                savingsGoal
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-[#e5e5e0] text-[#aaa]'
              )}
            >
              다음
            </button>
          </div>
        )}

        {/* Priorities */}
        {step === 'priorities' && (
          <div className="flex-1 flex flex-col">
            <button
              onClick={handleBack}
              className="self-start p-2 -ml-2 text-[#888]"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 flex flex-col -mt-4">
              <p className="text-sm text-[#888] mb-2">03</p>
              <h1 className="text-3xl font-bold mb-2">
                어떨 때 돈이<br />아깝지 않나요?
              </h1>
              <p className="text-[#888] mb-6">최대 3개 선택</p>

              <div className="space-y-3 flex-1 overflow-auto">
                {PRIORITIES.map((priority, index) => {
                  const isSelected = selectedPriorities.includes(priority);
                  const isDisabled = !isSelected && selectedPriorities.length >= 3;

                  return (
                    <button
                      key={priority}
                      onClick={() => !isDisabled && togglePriority(priority)}
                      disabled={isDisabled}
                      className={cn(
                        'w-full p-5 rounded-2xl text-left transition-all',
                        isSelected
                          ? `${PRIORITY_COLORS[index]} ring-2 ring-[#1a1a1a]`
                          : 'bg-white',
                        isDisabled && 'opacity-50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold">{priority}</p>
                          <p className="text-sm text-[#666] mt-1">
                            {PRIORITY_DESCRIPTIONS[priority]}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2">
                              <path d="M2 7l3 3 7-7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 bg-[#1a1a1a] text-white rounded-full text-lg font-medium mt-6"
            >
              다음
            </button>
          </div>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="flex-1 flex flex-col">
            <button
              onClick={handleBack}
              className="self-start p-2 -ml-2 text-[#888]"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 flex flex-col justify-center -mt-8">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-[#c5d5c5] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg width="40" height="40" fill="none" stroke="#1a1a1a" strokeWidth="2">
                    <path d="M8 20l8 8 16-16" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold">준비 완료!</h1>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#888]">월 수입</span>
                    <span className="text-xl font-bold">
                      {parseInt(monthlyIncome, 10).toLocaleString()}원
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#888]">저축 목표</span>
                    <span className="text-xl font-bold">
                      {parseInt(savingsGoal, 10).toLocaleString()}원
                    </span>
                  </div>
                </div>

                <div className="bg-[#c5d5c5] rounded-2xl p-5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#555]">사용 가능</span>
                    <span className="text-xl font-bold">
                      {(parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)).toLocaleString()}원
                    </span>
                  </div>
                </div>

                {selectedPriorities.length > 0 && (
                  <div className="bg-white rounded-2xl p-5">
                    <p className="text-[#888] text-sm mb-3">우선순위</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPriorities.map((priority) => (
                        <span
                          key={priority}
                          className={cn(
                            'px-4 py-2 rounded-full text-sm font-medium',
                            PRIORITY_COLORS[PRIORITIES.indexOf(priority)]
                          )}
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
              className="w-full py-4 bg-[#1a1a1a] text-white rounded-full text-lg font-medium"
            >
              시작하기
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
