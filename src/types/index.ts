export interface Budget {
  id: string;
  amount: number;
  startDay: number; // 월 시작일 (1-31)
  startDate: string; // ISO 날짜 문자열
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string; // ISO 날짜 문자열
  title: string;
  amount: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyBudget {
  weekNumber: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  remaining: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface BudgetStats {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  currentWeekBudget: number;
  currentWeekSpent: number;
  currentWeekRemaining: number;
  weeklyBudgets: WeeklyBudget[];
}
