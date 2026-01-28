export type Category =
  | '식비'
  | '교통'
  | '쇼핑'
  | '문화/여가'
  | '의료'
  | '교육'
  | '주거'
  | '기타';

export type Verdict = 'good' | 'bad' | 'neutral';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: Category;
  memo: string;
  verdict?: Verdict;
  reason?: string; // AI 판단 이유
  createdAt: string;
}

export const CATEGORIES: Category[] = [
  '식비',
  '교통',
  '쇼핑',
  '문화/여가',
  '의료',
  '교육',
  '주거',
  '기타',
];
