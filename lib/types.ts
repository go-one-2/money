export type Category =
  | '식비'
  | '교통'
  | '쇼핑'
  | '문화/여가'
  | '의료'
  | '교육'
  | '주거'
  | '기타';

// 세부 카테고리 (메모 기반으로 판별)
export type SubCategory =
  | '외식'
  | '커피'
  | '술'
  | '배달음식'
  | '일반';

export type Verdict = 'good' | 'bad';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: Category;
  memo: string;
  verdict?: Verdict;
  reason?: string; // AI 판단 이유
  subCategory?: SubCategory; // 세부 카테고리
  createdAt: string;
}

// 사용자 설정
export interface UserSettings {
  monthlyIncome: number; // 월 수입
  savingsGoal: number; // 월 저축 목표 (한달에 남길 돈)
  essentialCategories: Category[]; // 필수 지출 카테고리 (무조건 무죄)
  priorities: Priority[]; // 소비 우선순위 (최대 3개)
  onboardingCompleted: boolean; // 온보딩 완료 여부
}

// 카테고리별 예산 비율 (월 수입 대비 %)
export const CATEGORY_BUDGET_RATIO: Partial<Record<Category, number>> = {
  '식비': 15,
  '쇼핑': 10,
  '문화/여가': 10,
};

// 세부 카테고리별 월 빈도 제한
export const SUB_CATEGORY_FREQUENCY_LIMIT: Record<SubCategory, number> = {
  '외식': 8,
  '커피': 15,
  '술': 8,
  '배달음식': 12,
  '일반': Infinity,
};

// 세부 카테고리 키워드 매핑
export const SUB_CATEGORY_KEYWORDS: Record<SubCategory, string[]> = {
  '외식': ['외식', '레스토랑', '식당', '맛집', '고기', '회', '초밥', '스시', '파스타', '피자', '치킨', '햄버거', '한식', '중식', '일식', '양식'],
  '커피': ['커피', '카페', '스타벅스', '투썸', '이디야', '빽다방', '메가커피', '컴포즈', '아메리카노', '라떼'],
  '술': ['술', '소주', '맥주', '와인', '위스키', '막걸리', '호프', '바', '이자카야', '포차', '회식'],
  '배달음식': ['배달', '배민', '쿠팡이츠', '요기요', '땡겨요'],
  '일반': [],
};

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

export const DEFAULT_USER_SETTINGS: UserSettings = {
  monthlyIncome: 3000000,
  savingsGoal: 500000,
  essentialCategories: ['의료', '교육', '주거', '교통'],
  priorities: [],
  onboardingCompleted: false,
};

// 소비 우선순위 타입
export type Priority =
  | '건강'
  | '자기계발'
  | '가족/지인과의 시간'
  | '실용/필수 우선'
  | '즐거움'
  | '교육/자녀'
  | '생활안정';

export const PRIORITIES: Priority[] = [
  '건강',
  '자기계발',
  '가족/지인과의 시간',
  '실용/필수 우선',
  '즐거움',
  '교육/자녀',
  '생활안정',
];

export const PRIORITY_DESCRIPTIONS: Record<Priority, string> = {
  '건강': '건강한 몸과 마음을 위한 투자',
  '자기계발': '성장과 배움을 위한 투자',
  '가족/지인과의 시간': '소중한 사람들과 함께하는 시간',
  '실용/필수 우선': '꼭 필요한 것에만 집중',
  '즐거움': '일상의 즐거움과 취미생활',
  '교육/자녀': '자녀 교육과 성장 지원',
  '생활안정': '안정적인 생활 기반 마련',
};

// 우선순위별 완화되는 카테고리 및 세부 키워드
export interface PriorityRule {
  categories: Category[];
  keywords: string[]; // 메모에서 매칭할 키워드
  description: string;
}

export const PRIORITY_RULES: Record<Priority, PriorityRule> = {
  '건강': {
    categories: ['의료', '식비', '문화/여가'],
    keywords: ['헬스', '운동', '필라테스', '요가', '수영', '건강', '영양제', '비타민', '샐러드', '건강식', '병원', '검진', '치료'],
    description: '건강 관련 지출',
  },
  '자기계발': {
    categories: ['교육', '문화/여가', '쇼핑'],
    keywords: ['책', '도서', '강의', '수업', '클래스', '학원', '온라인강의', '인강', '자격증', '시험', '공부', '세미나', '워크샵'],
    description: '자기계발 관련 지출',
  },
  '가족/지인과의 시간': {
    categories: ['문화/여가', '식비', '교통'],
    keywords: ['가족', '부모님', '친구', '모임', '데이트', '약속', '선물', '카페', '브런치', '여행', '나들이'],
    description: '소중한 사람들과의 시간',
  },
  '실용/필수 우선': {
    categories: [], // 완화 없음, 오히려 강화
    keywords: [],
    description: '필수 지출만 허용',
  },
  '즐거움': {
    categories: ['문화/여가', '쇼핑'],
    keywords: ['영화', '공연', '콘서트', '전시', '게임', '취미', '덕질', '굿즈', '앨범', '놀이공원', 'OTT', '넷플릭스'],
    description: '여가와 취미 활동',
  },
  '교육/자녀': {
    categories: ['교육', '의료', '쇼핑'],
    keywords: ['학원', '과외', '학교', '유치원', '어린이집', '학용품', '교재', '아이', '자녀', '육아', '예방접종', '소아과'],
    description: '자녀 관련 지출',
  },
  '생활안정': {
    categories: ['주거', '교통', '쇼핑'],
    keywords: ['월세', '관리비', '공과금', '가전', '가구', '인테리어', '수리', '청소', '생필품', '세탁기', '냉장고', '에어컨'],
    description: '생활 안정을 위한 지출',
  },
};
