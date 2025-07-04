import { Budget, Expense, WeeklyBudget, BudgetStats } from '@/types';
import { getExpenses } from './storage';
import { startOfWeek, endOfWeek, addDays, addMonths } from 'date-fns';

export const calculateWeeklyBudgets = (budget: Budget): WeeklyBudget[] => {
  const startDate = new Date(budget.startDate);
  const endDate = getNextMonthStartDate(startDate);
  const weeks = getWeeklyBudgets(startDate, endDate);
  const expenses = getExpenses();

  return weeks.map((week, index) => {
    const weekStart = week.startDate;
    const weekEnd = week.endDate;

    // 해당 주의 지출 계산
    const weekExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= weekStart && expenseDate <= weekEnd;
    });

    const spent = weekExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // 주간 예산 계산 (주차 수만큼 균등하게 분배)
    const weeklyBudget = Math.floor(budget.amount / weeks.length);

    return {
      weekNumber: index + 1,
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      budget: weeklyBudget,
      spent,
      remaining: weeklyBudget - spent,
    };
  });
};

export function getBudgetStats(budget: Budget): BudgetStats {
  const expenses = getExpenses();

  // 주간 예산 계산
  const weeklyBudgets: WeeklyBudget[] = [];
  const startDate = new Date(budget.startDate);
  const endDate = getNextMonthStartDate(startDate);
  const weeks = getWeeklyBudgets(startDate, endDate);

  let weekNumber = 1;

  for (const week of weeks) {
    // 주간 예산 계산 (전체 예산을 주 수로 나누기)
    const weekBudget = Math.floor(budget.amount / weeks.length);

    // 해당 주의 지출 계산
    const weekExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= week.startDate && expenseDate <= week.endDate;
    });

    const weekSpent = weekExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const weekRemaining = weekBudget - weekSpent;

    weeklyBudgets.push({
      weekNumber,
      startDate: week.startDate.toISOString(),
      endDate: week.endDate.toISOString(),
      budget: weekBudget,
      spent: weekSpent,
      remaining: weekRemaining,
    });

    weekNumber++;
  }

  // 총 지출 계산
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalRemaining = budget.amount - totalSpent;

  // 현재 주 예산 찾기
  const now = new Date();
  const currentWeek = weeklyBudgets.find(
    (week) => now >= new Date(week.startDate) && now <= new Date(week.endDate)
  );

  return {
    totalBudget: budget.amount,
    totalSpent,
    totalRemaining,
    currentWeekBudget: currentWeek?.budget || 0,
    currentWeekSpent: currentWeek?.spent || 0,
    currentWeekRemaining: currentWeek?.remaining || 0,
    weeklyBudgets,
  };
}

export const getExpensesByCategory = (expenses: Expense[]) => {
  const categoryMap = new Map<string, number>();

  expenses.forEach((expense) => {
    const current = categoryMap.get(expense.category) || 0;
    categoryMap.set(expense.category, current + expense.amount);
  });

  return Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
  }));
};

export const getExpensesByDate = (
  expenses: Expense[],
  startDate: Date,
  endDate: Date
) => {
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
};

export const getMonthlyExpenses = (
  expenses: Expense[],
  year: number,
  month: number
) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return getExpensesByDate(expenses, startDate, endDate);
};

// Helper functions
function getNextMonthStartDate(startDate: Date): Date {
  // 다음 달의 같은 날짜를 계산
  const nextMonthDate = addMonths(startDate, 1);

  // 다음 달 startDate의 전날을 반환
  const endDate = new Date(nextMonthDate);
  endDate.setDate(endDate.getDate() - 1);

  return endDate;
}

function getWeeklyBudgets(
  startDate: Date,
  endDate: Date
): Array<{ startDate: Date; endDate: Date }> {
  const weeks = [];

  // 시작일이 속한 주의 월요일부터 시작
  let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // 1 = 월요일
  let currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 }); // 일요일

  while (currentWeekStart <= endDate) {
    // 주차가 시작일과 종료일 범위에 포함되는 경우만 추가
    if (currentWeekEnd >= startDate) {
      weeks.push({
        startDate: new Date(currentWeekStart),
        endDate: new Date(currentWeekEnd),
      });
    }

    // 다음 주로 이동 (7일 후)
    currentWeekStart = addDays(currentWeekStart, 7);
    currentWeekEnd = addDays(currentWeekEnd, 7);
  }

  return weeks;
}
