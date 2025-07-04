import { Budget, Expense, WeeklyBudget, BudgetStats } from '@/types';
import {
  getMonthStartDate,
  getMonthEndDate,
  getWeeklyBudgets,
  getCurrentWeek,
} from './dateUtils';
import { getExpenses } from './storage';

export const calculateWeeklyBudgets = (budget: Budget): WeeklyBudget[] => {
  const startDate = new Date(budget.startDate);
  const endDate = getMonthEndDate(startDate);
  const weeks = getWeeklyBudgets(startDate, endDate, budget.amount);
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

export const getBudgetStats = (budget: Budget): BudgetStats => {
  const weeklyBudgets = calculateWeeklyBudgets(budget);
  const currentWeek = getCurrentWeek(new Date(budget.startDate));
  const currentWeekData =
    weeklyBudgets.find((w) => w.weekNumber === currentWeek) || weeklyBudgets[0];

  const totalBudget = budget.amount;
  const totalSpent = weeklyBudgets.reduce((sum, week) => sum + week.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return {
    totalBudget,
    totalSpent,
    totalRemaining,
    currentWeekBudget: currentWeekData.budget,
    currentWeekSpent: currentWeekData.spent,
    currentWeekRemaining: currentWeekData.remaining,
    weeklyBudgets,
  };
};

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
