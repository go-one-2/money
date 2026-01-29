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

const COLORS = {
  coral: '#FF6B4A',
  black: '#1A1A1A',
  cream: '#F5F0E8',
  white: '#FFFFFF',
};

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

  const handleKeypad = (key: string, setter: (fn: (prev: string) => string) => void) => {
    if (key === '←') {
      setter((prev) => prev.slice(0, -1));
    } else {
      setter((prev) => prev + key);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Welcome - 대담한 분할 레이아웃 */}
      {step === 'welcome' && (
        <div className="min-h-screen flex flex-col">
          {/* 상단 코랄 영역 */}
          <div
            className="flex-1 p-6 flex flex-col"
            style={{ backgroundColor: COLORS.coral }}
          >
            {/* 네비게이션 라인 */}
            <div className="flex items-center gap-4 mb-auto">
              <div className="w-12 h-0.5 bg-white" />
              <div className="w-12 h-0.5 bg-white/30" />
              <div className="w-12 h-0.5 bg-white/30" />
            </div>

            {/* 메인 타이틀 */}
            <div className="my-auto">
              <p className="text-white/70 text-sm tracking-widest mb-4">2024</p>
              <h1 className="text-7xl font-bold text-white leading-none tracking-tight">
                소비
                <br />
                판단
              </h1>
            </div>

            {/* 장식 라인 */}
            <div className="flex justify-end">
              <svg width="100" height="80" viewBox="0 0 100 80" className="text-white/30">
                <line x1="0" y1="40" x2="100" y2="0" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="40" x2="100" y2="80" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
          </div>

          {/* 하단 크림 영역 */}
          <div
            className="p-6"
            style={{ backgroundColor: COLORS.cream }}
          >
            <p className="text-lg mb-6" style={{ color: COLORS.black }}>
              현명한 소비 습관을
              <br />
              만들어드립니다.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleNext}
                className="flex-1 py-4 font-semibold text-white"
                style={{ backgroundColor: COLORS.black }}
              >
                시작하기
              </button>
              <button
                onClick={handleSkip}
                className="px-6 py-4 font-medium border-2"
                style={{ borderColor: COLORS.black, color: COLORS.black }}
              >
                건너뛰기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Income - 그리드 키패드 스타일 */}
      {step === 'income' && (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.cream }}>
          {/* 상단 정보 영역 */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handleBack}
                className="text-sm font-medium"
                style={{ color: COLORS.black }}
              >
                ← 이전
              </button>
              <div className="flex gap-1">
                <div className="w-8 h-1" style={{ backgroundColor: COLORS.coral }} />
                <div className="w-8 h-1" style={{ backgroundColor: COLORS.black + '20' }} />
                <div className="w-8 h-1" style={{ backgroundColor: COLORS.black + '20' }} />
                <div className="w-8 h-1" style={{ backgroundColor: COLORS.black + '20' }} />
              </div>
              <button onClick={handleSkip} className="text-sm" style={{ color: COLORS.black + '60' }}>
                건너뛰기
              </button>
            </div>

            {/* 스텝 넘버 */}
            <div
              className="inline-block px-3 py-1 text-xs font-bold tracking-wider mb-4"
              style={{ backgroundColor: COLORS.coral, color: COLORS.white }}
            >
              STEP 01
            </div>

            <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.black }}>
              월 수입
            </h2>
            <p className="text-sm" style={{ color: COLORS.black + '60' }}>세후 기준으로 입력해주세요</p>
          </div>

          {/* 금액 표시 - 블랙 배경 */}
          <div className="p-6" style={{ backgroundColor: COLORS.black }}>
            <div className="flex items-baseline justify-between">
              <span className="text-5xl font-bold text-white tracking-tight">
                {formatNumber(monthlyIncome) || '0'}
              </span>
              <span className="text-xl text-white/50">원</span>
            </div>
          </div>

          {/* 키패드 그리드 */}
          <div className="flex-1 p-2" style={{ backgroundColor: COLORS.white }}>
            <div className="grid grid-cols-3 gap-1 h-full">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '←'].map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeypad(key, setMonthlyIncome)}
                  className={cn(
                    'text-2xl font-medium transition-colors',
                    key === '←' ? 'text-lg' : ''
                  )}
                  style={{
                    backgroundColor: COLORS.cream,
                    color: COLORS.black,
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* 다음 버튼 */}
          <div className="p-4" style={{ backgroundColor: COLORS.white }}>
            <button
              onClick={handleNext}
              disabled={!monthlyIncome}
              className={cn(
                'w-full py-4 font-semibold text-lg transition-colors',
                monthlyIncome ? 'text-white' : 'text-white/50'
              )}
              style={{
                backgroundColor: monthlyIncome ? COLORS.coral : COLORS.coral + '40',
              }}
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Savings - 분할 레이아웃 */}
      {step === 'savings' && (
        <div className="min-h-screen flex flex-col">
          {/* 상단 블랙 영역 */}
          <div className="p-6" style={{ backgroundColor: COLORS.black }}>
            <div className="flex items-center justify-between mb-8">
              <button onClick={handleBack} className="text-sm font-medium text-white">
                ← 이전
              </button>
              <div className="flex gap-1">
                <div className="w-8 h-1" style={{ backgroundColor: COLORS.coral }} />
                <div className="w-8 h-1" style={{ backgroundColor: COLORS.coral }} />
                <div className="w-8 h-1 bg-white/20" />
                <div className="w-8 h-1 bg-white/20" />
              </div>
              <button onClick={handleSkip} className="text-sm text-white/40">
                건너뛰기
              </button>
            </div>

            <div
              className="inline-block px-3 py-1 text-xs font-bold tracking-wider mb-4"
              style={{ backgroundColor: COLORS.coral, color: COLORS.white }}
            >
              STEP 02
            </div>

            <h2 className="text-2xl font-bold text-white mb-6">
              저축 목표
            </h2>

            {/* 저축 금액 */}
            <div className="flex items-baseline justify-between border-b border-white/20 pb-4">
              <span className="text-5xl font-bold text-white tracking-tight">
                {formatNumber(savingsGoal) || '0'}
              </span>
              <span className="text-xl text-white/50">원</span>
            </div>

            {/* 사용 가능 금액 표시 */}
            {monthlyIncome && savingsGoal && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-white/50 text-sm">사용 가능 금액</span>
                <span className="text-lg font-bold" style={{ color: COLORS.coral }}>
                  {(parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)).toLocaleString()}원
                </span>
              </div>
            )}
          </div>

          {/* 키패드 - 코랄 배경 */}
          <div className="flex-1 p-2" style={{ backgroundColor: COLORS.coral }}>
            <div className="grid grid-cols-3 gap-1 h-full">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '←'].map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeypad(key, setSavingsGoal)}
                  className="text-2xl font-medium text-white/90 hover:bg-white/10 transition-colors"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* 다음 버튼 */}
          <div className="p-4" style={{ backgroundColor: COLORS.coral }}>
            <button
              onClick={handleNext}
              disabled={!savingsGoal}
              className={cn(
                'w-full py-4 font-semibold text-lg transition-colors',
                savingsGoal ? '' : 'opacity-40'
              )}
              style={{
                backgroundColor: COLORS.black,
                color: COLORS.white,
              }}
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Priorities - 리스트 스타일 */}
      {step === 'priorities' && (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.cream }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handleBack}
                className="text-sm font-medium"
                style={{ color: COLORS.black }}
              >
                ← 이전
              </button>
              <div className="flex gap-1">
                <div className="w-8 h-1" style={{ backgroundColor: COLORS.coral }} />
                <div className="w-8 h-1" style={{ backgroundColor: COLORS.coral }} />
                <div className="w-8 h-1" style={{ backgroundColor: COLORS.coral }} />
                <div className="w-8 h-1" style={{ backgroundColor: COLORS.black + '20' }} />
              </div>
              <button onClick={handleSkip} className="text-sm" style={{ color: COLORS.black + '60' }}>
                건너뛰기
              </button>
            </div>

            <div
              className="inline-block px-3 py-1 text-xs font-bold tracking-wider mb-4"
              style={{ backgroundColor: COLORS.black, color: COLORS.white }}
            >
              STEP 03
            </div>

            <h2 className="text-2xl font-bold mb-1" style={{ color: COLORS.black }}>
              소비 우선순위
            </h2>
            <p className="text-sm mb-6" style={{ color: COLORS.black + '60' }}>
              최대 3개까지 선택 가능합니다
            </p>
          </div>

          {/* 우선순위 리스트 */}
          <div className="flex-1 overflow-auto">
            {PRIORITIES.map((priority, index) => {
              const isSelected = selectedPriorities.includes(priority);
              const isDisabled = !isSelected && selectedPriorities.length >= 3;

              return (
                <button
                  key={priority}
                  onClick={() => !isDisabled && togglePriority(priority)}
                  disabled={isDisabled}
                  className={cn(
                    'w-full text-left transition-all border-b',
                    isDisabled && 'opacity-30'
                  )}
                  style={{
                    backgroundColor: isSelected ? COLORS.coral : COLORS.white,
                    borderColor: COLORS.cream,
                  }}
                >
                  <div className="flex items-center p-4">
                    {/* 인덱스 넘버 */}
                    <span
                      className={cn(
                        'w-8 h-8 flex items-center justify-center text-sm font-bold mr-4',
                        isSelected ? 'text-white' : ''
                      )}
                      style={{
                        backgroundColor: isSelected ? 'rgba(0,0,0,0.2)' : COLORS.cream,
                        color: isSelected ? COLORS.white : COLORS.black,
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="flex-1">
                      <p
                        className="font-semibold"
                        style={{ color: isSelected ? COLORS.white : COLORS.black }}
                      >
                        {priority}
                      </p>
                      <p
                        className="text-sm mt-0.5"
                        style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : COLORS.black + '60' }}
                      >
                        {PRIORITY_DESCRIPTIONS[priority]}
                      </p>
                    </div>

                    {/* 체크 */}
                    {isSelected && (
                      <div
                        className="w-6 h-6 flex items-center justify-center"
                        style={{ backgroundColor: COLORS.black }}
                      >
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

          {/* 다음 버튼 */}
          <div className="p-4" style={{ backgroundColor: COLORS.white }}>
            <button
              onClick={handleNext}
              className="w-full py-4 font-semibold text-lg text-white"
              style={{ backgroundColor: COLORS.black }}
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Complete - 대담한 요약 */}
      {step === 'complete' && (
        <div className="min-h-screen flex flex-col">
          {/* 상단 코랄 영역 - 큰 숫자 표시 */}
          <div
            className="flex-1 p-6 flex flex-col"
            style={{ backgroundColor: COLORS.coral }}
          >
            <div className="flex items-center justify-between mb-4">
              <button onClick={handleBack} className="text-sm font-medium text-white">
                ← 이전
              </button>
              <div className="flex gap-1">
                <div className="w-8 h-1 bg-white" />
                <div className="w-8 h-1 bg-white" />
                <div className="w-8 h-1 bg-white" />
                <div className="w-8 h-1 bg-white" />
              </div>
              <span className="text-sm text-white/60">완료</span>
            </div>

            <div className="my-auto">
              <p className="text-white/70 text-sm tracking-widest mb-2">MONTHLY BUDGET</p>
              <div className="flex items-baseline">
                <span className="text-7xl font-bold text-white tracking-tighter">
                  {Math.round((parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)) / 10000)}
                </span>
                <span className="text-3xl text-white/70 ml-1">만원</span>
              </div>
              <p className="text-white/60 text-sm mt-2">
                매일 {Math.round((parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)) / 30).toLocaleString()}원 사용 가능
              </p>
            </div>

            {/* 장식 라인 */}
            <div className="flex items-center gap-4 text-white/30">
              <div className="flex-1 h-px bg-current" />
              <span className="text-xs tracking-widest">READY</span>
              <div className="flex-1 h-px bg-current" />
            </div>
          </div>

          {/* 하단 블랙 영역 - 요약 */}
          <div className="p-6" style={{ backgroundColor: COLORS.black }}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-white/40 text-xs mb-1">월 수입</p>
                <p className="text-white font-bold">
                  {parseInt(monthlyIncome, 10).toLocaleString()}원
                </p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">저축 목표</p>
                <p className="text-white font-bold">
                  {parseInt(savingsGoal, 10).toLocaleString()}원
                </p>
              </div>
            </div>

            {selectedPriorities.length > 0 && (
              <div className="mb-6">
                <p className="text-white/40 text-xs mb-2">우선순위</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPriorities.map((priority) => (
                    <span
                      key={priority}
                      className="px-3 py-1 text-sm font-medium"
                      style={{ backgroundColor: COLORS.coral, color: COLORS.white }}
                    >
                      {priority}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleComplete}
              className="w-full py-4 font-semibold text-lg"
              style={{ backgroundColor: COLORS.white, color: COLORS.black }}
            >
              시작하기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
