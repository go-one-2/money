import { NextRequest, NextResponse } from 'next/server';
import type { Expense, Verdict } from '@/lib/types';

// 임시 규칙 기반 판단 로직 (추후 AI API로 교체 예정)
function analyzeExpense(expense: Expense): { verdict: Verdict; reason: string } {
  const { category, amount, memo } = expense;

  // 필수 지출 카테고리
  const essentialCategories = ['의료', '교육', '주거', '교통'];
  if (essentialCategories.includes(category)) {
    return {
      verdict: 'good',
      reason: `${category}은(는) 생활에 필요한 필수 지출입니다.`,
    };
  }

  // 금액 기준 판단
  if (category === '식비') {
    if (amount <= 10000) {
      return {
        verdict: 'good',
        reason: '합리적인 식비 지출입니다.',
      };
    } else if (amount <= 30000) {
      return {
        verdict: 'neutral',
        reason: '적정 수준의 식비입니다. 자주 반복되면 주의가 필요합니다.',
      };
    } else {
      return {
        verdict: 'bad',
        reason: '높은 금액의 식비입니다. 외식이나 배달 빈도를 줄여보세요.',
      };
    }
  }

  if (category === '쇼핑') {
    if (amount <= 30000) {
      return {
        verdict: 'neutral',
        reason: '소소한 쇼핑입니다.',
      };
    } else {
      // 메모에 '필요', '필수' 등이 있으면 neutral로 판단
      if (memo && (memo.includes('필요') || memo.includes('필수'))) {
        return {
          verdict: 'neutral',
          reason: '필요한 물품 구매로 보입니다.',
        };
      }
      return {
        verdict: 'bad',
        reason: '충동 구매가 아닌지 다시 생각해보세요. 정말 필요한 물건인가요?',
      };
    }
  }

  if (category === '문화/여가') {
    if (amount <= 20000) {
      return {
        verdict: 'good',
        reason: '적절한 여가 활동 비용입니다. 정신 건강에 좋습니다.',
      };
    } else if (amount <= 50000) {
      return {
        verdict: 'neutral',
        reason: '여가 활동에 적당한 투자입니다.',
      };
    } else {
      return {
        verdict: 'bad',
        reason: '과도한 여가 비용입니다. 더 저렴한 대안을 찾아보세요.',
      };
    }
  }

  // 기타 카테고리는 금액으로만 판단
  if (amount <= 10000) {
    return {
      verdict: 'neutral',
      reason: '소액 지출입니다.',
    };
  } else if (amount <= 50000) {
    return {
      verdict: 'neutral',
      reason: '일반적인 지출 범위입니다.',
    };
  } else {
    return {
      verdict: 'bad',
      reason: '큰 금액의 지출입니다. 정말 필요한 지출인지 고민해보세요.',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const expense: Expense = await request.json();

    // TODO: 실제 AI API 연동 시 이 부분을 교체
    // const aiResponse = await fetch('https://ai-api.example.com/analyze', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(expense),
    // });
    // const result = await aiResponse.json();

    const result = analyzeExpense(expense);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { verdict: 'neutral', reason: '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
