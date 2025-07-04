import { Budget, Expense, WeeklyBudget, BudgetStats } from '@/types';
import { getExpenses } from './storage';

export const calculateWeeklyBudgets = (budget: Budget): WeeklyBudget[] => {
  const startDate = new Date(budget.startDate);
  const endDate = getMonthEndDate(startDate);
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

    // 주간 예산 계산 (마지막 주는 남은 금액)
    let weeklyBudget: number;
    if (index === weeks.length - 1) {
      const previousWeeksBudget =
        (weeks.length - 1) * (budget.amount / weeks.length);
      weeklyBudget = budget.amount - previousWeeksBudget;
    } else {
      weeklyBudget = Math.floor(budget.amount / weeks.length);
    }

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
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);

  const currentDate = new Date(startDate);
  let weekNumber = 1;

  while (currentDate <= endDate) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // 주간 예산 계산 (월 예산을 주 수로 나누기)
    const weekBudget = Math.round(budget.amount / 4);

    // 해당 주의 지출 계산
    const weekExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= weekStart && expenseDate <= weekEnd;
    });

    const weekSpent = weekExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const weekRemaining = weekBudget - weekSpent;

    weeklyBudgets.push({
      weekNumber,
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      budget: weekBudget,
      spent: weekSpent,
      remaining: weekRemaining,
    });

    currentDate.setDate(currentDate.getDate() + 7);
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
function getMonthEndDate(startDate: Date): Date {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  return endDate;
}

function getWeeklyBudgets(
  startDate: Date,
  endDate: Date
): Array<{ startDate: Date; endDate: Date }> {
  const weeks = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    weeks.push({
      startDate: weekStart,
      endDate: weekEnd,
    });

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
}
