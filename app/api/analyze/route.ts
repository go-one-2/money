import { NextRequest, NextResponse } from 'next/server';
import type { Expense, Verdict, UserSettings, SubCategory, Category, Priority } from '@/lib/types';
import {
  SUB_CATEGORY_KEYWORDS,
  SUB_CATEGORY_FREQUENCY_LIMIT,
  CATEGORY_BUDGET_RATIO,
  PRIORITY_RULES,
} from '@/lib/types';

interface AnalyzeRequest {
  expense: Expense;
  userSettings: UserSettings;
  monthlyStats: {
    subCategoryCounts: Record<SubCategory, number>;
    categoryTotals: Record<Category, number>;
    totalSpent: number;
    remainingDays: number;
  };
}

// 메모에서 세부 카테고리 추출
function detectSubCategory(memo: string): SubCategory {
  const lowerMemo = memo.toLowerCase();

  for (const [subCategory, keywords] of Object.entries(SUB_CATEGORY_KEYWORDS)) {
    if (subCategory === '일반') continue;
    for (const keyword of keywords) {
      if (lowerMemo.includes(keyword.toLowerCase())) {
        return subCategory as SubCategory;
      }
    }
  }

  return '일반';
}

// 일일 예산 계산
function calculateDailyBudget(
  monthlyIncome: number,
  savingsGoal: number,
  totalSpent: number,
  remainingDays: number
): number {
  const availableBudget = monthlyIncome - savingsGoal;
  const remainingBudget = availableBudget - totalSpent;
  return remainingDays > 0 ? remainingBudget / remainingDays : 0;
}

// 우선순위 매칭 확인
function checkPriorityMatch(
  category: Category,
  memo: string,
  priorities: Priority[]
): { matched: boolean; priority: Priority | null; reason: string } {
  const lowerMemo = memo.toLowerCase();

  for (const priority of priorities) {
    // 실용/필수 우선은 완화 없음
    if (priority === '실용/필수 우선') continue;

    const rule = PRIORITY_RULES[priority];

    // 카테고리 매칭 확인
    const categoryMatched = rule.categories.includes(category);

    // 키워드 매칭 확인
    const keywordMatched = rule.keywords.some((keyword) =>
      lowerMemo.includes(keyword.toLowerCase())
    );

    if (categoryMatched || keywordMatched) {
      return {
        matched: true,
        priority,
        reason: `'${priority}' 우선순위에 부합하는 ${rule.description}입니다.`,
      };
    }
  }

  return { matched: false, priority: null, reason: '' };
}

// 실용/필수 우선 모드 체크
function isStrictMode(priorities: Priority[]): boolean {
  return priorities.includes('실용/필수 우선');
}

function analyzeExpense(
  expense: Expense,
  userSettings: UserSettings,
  monthlyStats: AnalyzeRequest['monthlyStats']
): { verdict: Verdict; reason: string; subCategory: SubCategory } {
  const { category, amount, memo } = expense;
  const { monthlyIncome, savingsGoal, essentialCategories, priorities } = userSettings;
  const { subCategoryCounts, categoryTotals, totalSpent, remainingDays } = monthlyStats;

  // 세부 카테고리 판별
  const subCategory = detectSubCategory(memo);

  // 1. 필수 지출 카테고리 체크 (무조건 무죄)
  if (essentialCategories.includes(category)) {
    return {
      verdict: 'good',
      reason: `${category}은(는) 필수 지출로 설정되어 있습니다.`,
      subCategory,
    };
  }

  // 2. 우선순위 매칭 확인
  const priorityMatch = checkPriorityMatch(category, memo, priorities);
  const strictMode = isStrictMode(priorities);

  const reasons: string[] = [];
  const relaxed = priorityMatch.matched && !strictMode;

  // 3. 고액 지출 체크
  // 기본 5% / 우선순위 매칭 시 3%로 완화 / 실용필수 모드 시 강화 없음(5% 유지)
  const highExpenseRatio = relaxed ? 0.07 : 0.05;
  const highExpenseThreshold = monthlyIncome * highExpenseRatio;
  if (amount > highExpenseThreshold) {
    reasons.push(
      `고액 지출입니다. (월 수입의 ${Math.round(highExpenseRatio * 100)}%인 ${highExpenseThreshold.toLocaleString()}원 초과)`
    );
  }

  // 4. 세부 카테고리 빈도 초과 체크
  // 우선순위 매칭 시 빈도 제한 20% 완화 / 실용필수 모드 시 20% 강화
  if (subCategory !== '일반') {
    const currentCount = subCategoryCounts[subCategory] || 0;
    let limit = SUB_CATEGORY_FREQUENCY_LIMIT[subCategory];

    if (relaxed) {
      limit = Math.ceil(limit * 1.2);
    } else if (strictMode) {
      limit = Math.floor(limit * 0.8);
    }

    if (currentCount >= limit) {
      reasons.push(
        `${subCategory} 빈도 초과입니다. (월 ${limit}회 제한, 현재 ${currentCount + 1}회)`
      );
    }
  }

  // 5. 카테고리별 월 예산 초과 체크
  // 우선순위 매칭 시 +5% 완화 / 실용필수 모드 시 20% 강화
  let budgetRatio = CATEGORY_BUDGET_RATIO[category];
  if (budgetRatio) {
    if (relaxed) {
      budgetRatio += 5;
    } else if (strictMode) {
      budgetRatio = Math.floor(budgetRatio * 0.8);
    }

    const categoryBudget = monthlyIncome * (budgetRatio / 100);
    const currentCategoryTotal = categoryTotals[category] || 0;
    if (currentCategoryTotal + amount > categoryBudget) {
      reasons.push(
        `${category} 월 예산 초과입니다. (예산: ${categoryBudget.toLocaleString()}원, 현재+이번: ${(currentCategoryTotal + amount).toLocaleString()}원)`
      );
    }
  }

  // 6. 저축 목표 위험 체크
  // 우선순위 매칭 시 4배로 완화 / 기본 3배
  if (remainingDays >= 7) {
    const dailyBudget = calculateDailyBudget(
      monthlyIncome,
      savingsGoal,
      totalSpent,
      remainingDays
    );
    const multiplier = relaxed ? 4 : 3;
    if (dailyBudget > 0 && amount > dailyBudget * multiplier) {
      reasons.push(
        `저축 목표 위험! 일일 예산(${Math.round(dailyBudget).toLocaleString()}원)의 ${multiplier}배를 초과했습니다.`
      );
    }
  }

  // 판정: 위반이 하나라도 있으면 유죄
  if (reasons.length > 0) {
    return {
      verdict: 'bad',
      reason: reasons.join(' '),
      subCategory,
    };
  }

  return {
    verdict: 'good',
    reason: relaxed
      ? `이 소비는 ${category} 카테고리로, ${priorityMatch.reason}`
      : '적정 범위 내의 지출입니다.',
    subCategory,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { expense, userSettings, monthlyStats } = body;

    const result = analyzeExpense(expense, userSettings, monthlyStats);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { verdict: 'good', reason: '분석 중 오류가 발생했습니다.', subCategory: '일반' },
      { status: 500 }
    );
  }
}
