'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useExpenseStore } from '@/lib/store';
import {
  PRIORITIES,
  PRIORITY_DESCRIPTIONS,
  type Priority,
} from '@/lib/types';
import { cn } from '@/lib/utils';

type Step = 'income' | 'savings' | 'priorities' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const { updateUserSettings } = useExpenseStore();

  const [step, setStep] = useState<Step>('income');
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
    if (step === 'income') {
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
    <main className="min-h-screen flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      {step === 'income' && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">월 수입이 얼마인가요?</h1>
            <p className="text-muted-foreground">
              세후 실수령액을 알려주세요
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Input
                  type="number"
                  placeholder="3,000,000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  inputMode="numeric"
                  className="text-xl h-14 pr-10"
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  원
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleSkip}>
              건너뛰기
            </Button>
            <Button
              className="flex-1"
              onClick={handleNext}
              disabled={!monthlyIncome}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {step === 'savings' && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">매달 얼마를 모으고 싶으세요?</h1>
            <p className="text-muted-foreground">
              저축 목표를 설정해주세요
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Input
                  type="number"
                  placeholder="500,000"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                  inputMode="numeric"
                  className="text-xl h-14 pr-10"
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  원
                </span>
              </div>
              {monthlyIncome && savingsGoal && (
                <p className="text-sm text-primary mt-3 text-center">
                  사용 가능 예산: 월{' '}
                  {(
                    parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)
                  ).toLocaleString()}
                  원
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep('income')}
            >
              이전
            </Button>
            <Button
              className="flex-1"
              onClick={handleNext}
              disabled={!savingsGoal}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {step === 'priorities' && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">
              어떨 때 돈이 아깝지 않나요?
            </h1>
            <p className="text-muted-foreground">
              최대 3개까지 선택할 수 있어요
            </p>
          </div>

          <div className="space-y-3">
            {PRIORITIES.map((priority) => {
              const isSelected = selectedPriorities.includes(priority);
              const isDisabled =
                !isSelected && selectedPriorities.length >= 3;

              return (
                <Card
                  key={priority}
                  className={cn(
                    'cursor-pointer transition-all',
                    isSelected && 'ring-2 ring-primary',
                    isDisabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => !isDisabled && togglePriority(priority)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
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
                    <div className="flex-1">
                      <p className="font-medium">{priority}</p>
                      <p className="text-sm text-muted-foreground">
                        {PRIORITY_DESCRIPTIONS[priority]}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-sm text-center text-muted-foreground">
            선택한 우선순위에 해당하는 소비는 기준이 완화돼요
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep('savings')}
            >
              이전
            </Button>
            <Button className="flex-1" onClick={handleNext}>
              다음
            </Button>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">설정 완료!</h1>
            <p className="text-muted-foreground">
              이제 소비를 기록하면 맞춤 분석을 받을 수 있어요
            </p>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">월 수입</span>
                <span className="font-medium">
                  {parseInt(monthlyIncome, 10).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">저축 목표</span>
                <span className="font-medium">
                  {parseInt(savingsGoal, 10).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">사용 가능 예산</span>
                <span className="font-medium text-primary">
                  {(
                    parseInt(monthlyIncome, 10) - parseInt(savingsGoal, 10)
                  ).toLocaleString()}
                  원
                </span>
              </div>
              {selectedPriorities.length > 0 && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground text-sm">
                    우선순위
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPriorities.map((priority) => (
                      <span
                        key={priority}
                        className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
                      >
                        {priority}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" onClick={handleComplete}>
            시작하기
          </Button>
        </div>
      )}
    </main>
  );
}
